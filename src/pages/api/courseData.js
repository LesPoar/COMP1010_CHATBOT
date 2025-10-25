import { getCourseContent, updateCourseContent, getCurrentPdfFilename, initializeDatabase } from '../../lib/db';

export default async function handler(req, res) {
  // Initialize database on first request
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }

  if (req.method === 'GET') {
    try {
      const content = await getCourseContent();
      const slidesFilename = await getCurrentPdfFilename();
      
      return res.status(200).json({
        topics: content.topics,
        learningObjectives: content.learningObjectives,
        aiScope: content.aiScope,
        slidesFilename: slidesFilename
      });
    } catch (error) {
      console.error('Error fetching course data:', error);
      return res.status(500).json({ 
        message: 'Error reading course data',
        error: error.message 
      });
    }
  }

  if (req.method === 'POST') {
    const token = req.headers.token;
    if (token !== 'authenticated') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const { topics, learningObjectives, aiScope } = req.body;
      
      if (!Array.isArray(topics) || !Array.isArray(learningObjectives) || typeof aiScope !== 'string') {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      await updateCourseContent(topics, learningObjectives, aiScope);
      
      return res.status(200).json({ success: true, message: 'Data updated successfully' });
    } catch (error) {
      console.error('Error updating course data:', error);
      return res.status(500).json({ 
        message: 'Error updating course data',
        error: error.message 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}