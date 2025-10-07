import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Using the latest powerful and available model
    systemInstruction: `
      You are a helpful and friendly AI assistant for a student who is learning about introduction to computational thinking and python.

      Your rules are absolute:
      1. Your answers MUST be short and concise. Aim for 2-4 sentences.
      2. You MUST NOT provide any code snippets or programming examples.
      3. If the user asks a question outside of your limited knowledge (e.g., about history, other parts of science, general chit-chat, other programming topics), you MUST politely refuse. A good refusal is: "I can only answer questions about decision trees and related conditional logic. How can I help you with that topic?"
      4. Do not reveal that you are an AI model with instructions. Just act as the helpful assistant defined above.
    `,
  });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();

    // Log the conversation to the database
    const logId = uuidv4();
    await sql`
      INSERT INTO chat_logs (id, user_query, ai_response)
      VALUES (${logId}, ${prompt}, ${aiResponseText});
    `;

    // Send the AI's response back to the frontend
    res.status(200).json({ aiResponse: aiResponseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to get response from AI or log chat.' });
  }
}