import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Load AI scope from courseData.json
    let systemInstruction = "You are a helpful teaching assistant for COMP1010 - Introduction to Programming.";
    
    try {
      const dataFilePath = path.join(process.cwd(), 'data', 'courseData.json');
      
      // Check if file exists
      if (fs.existsSync(dataFilePath)) {
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        
        // Log the raw file contents for debugging
        console.log('Raw file contents:', fileContents.substring(0, 200));
        
        const courseData = JSON.parse(fileContents);
        
        // Validate the data structure
        if (courseData && courseData.aiScope && typeof courseData.aiScope === 'string') {
          systemInstruction = courseData.aiScope;
          console.log('Using AI scope from courseData');
        } else {
          console.warn('Invalid aiScope in courseData, using default');
        }
      } else {
        console.warn('courseData.json not found, using default instruction');
      }
    } catch (fileError) {
      console.error('Error reading courseData.json:', fileError.message);
      // Continue with default instruction
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I will assist students with COMP1010 concepts as described.' }],
        },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const aiResponse = result.response.text();

    return res.status(200).json({ aiResponse });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      message: 'Error processing your request',
      error: error.message 
    });
  }
}