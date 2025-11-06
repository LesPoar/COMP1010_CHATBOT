import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';
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
    // Load AI scope from database
    let systemInstruction = "You are a helpful teaching assistant for COMP1010 - Introduction to Programming.";
    
    try {
      const result = await sql`
        SELECT ai_scope 
        FROM course_content 
        ORDER BY id DESC 
        LIMIT 1
      `;
      
      if (result.rows.length > 0 && result.rows[0].ai_scope) {
        systemInstruction = result.rows[0].ai_scope;
        console.log('Using AI scope from database');
      } else {
        console.warn('No ai_scope found in database, using default instruction');
      }
    } catch (dbError) {
      console.error('Error reading from database:', dbError.message);
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

    // Save conversation to database with generated UUID
    await sql`
      INSERT INTO chat_logs (id, user_query, ai_response, created_at)
      VALUES (gen_random_uuid(), ${prompt}, ${aiResponse}, NOW())
    `;

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