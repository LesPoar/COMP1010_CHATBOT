import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'courseData.json');

// Default data in case file doesn't exist
const defaultData = {
  topics: [
    {
      id: 1,
      title: "Introduction to Programming",
      questions: [
        "What is a variable?",
        "Explain the difference between compilation and interpretation"
      ]
    }
  ],
  learningObjectives: [
    "Understand fundamental programming concepts"
  ],
  aiScope: "You are a helpful teaching assistant for COMP1010.",
  slidesFilename: "lecture9.pdf"
};

// Validate course data structure
function validateCourseData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure');
  }
  
  if (!Array.isArray(data.topics)) {
    throw new Error('Topics must be an array');
  }
  
  if (!Array.isArray(data.learningObjectives)) {
    throw new Error('Learning objectives must be an array');
  }
  
  if (typeof data.aiScope !== 'string') {
    throw new Error('AI scope must be a string');
  }
  
  // Validate each topic
  data.topics.forEach((topic, index) => {
    if (!topic.id || !topic.title) {
      throw new Error(`Topic at index ${index} is missing id or title`);
    }
    if (!Array.isArray(topic.questions)) {
      throw new Error(`Topic "${topic.title}" must have questions array`);
    }
  });
  
  return true;
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check if data directory exists, create it if not
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Check if file exists, create it with default data if not
      if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
        return res.status(200).json(defaultData);
      }

      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContents);
      
      // Validate before returning
      validateCourseData(data);
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error reading course data:', error);
      
      // If validation fails, return default data
      if (error.message.includes('Invalid') || error.message.includes('must')) {
        console.error('Data validation failed, returning default data');
        return res.status(200).json(defaultData);
      }
      
      return res.status(500).json({ 
        message: 'Error reading course data',
        error: error.message 
      });
    }
  }

  if (req.method === 'POST') {
    // Simple authentication check
    const token = req.headers.token;
    if (token !== 'authenticated') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const newData = req.body;
      
      // Validate data before saving
      validateCourseData(newData);
      
      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Write with proper formatting
      fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
      
      return res.status(200).json({ success: true, message: 'Data updated successfully' });
    } catch (error) {
      console.error('Error writing course data:', error);
      return res.status(500).json({ 
        message: 'Error updating course data',
        error: error.message 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}