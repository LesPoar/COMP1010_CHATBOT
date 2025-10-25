import { sql } from '@vercel/postgres';

// Get course content
export async function getCourseContent() {
  try {
    const { rows } = await sql`
      SELECT topics, learning_objectives, ai_scope 
      FROM course_content 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      return {
        topics: [],
        learningObjectives: [],
        aiScope: 'You are a helpful teaching assistant for COMP1010 - Introduction to Programming.'
      };
    }
    
    return {
      topics: rows[0].topics,
      learningObjectives: rows[0].learning_objectives,
      aiScope: rows[0].ai_scope
    };
  } catch (error) {
    console.error('Error getting course content:', error);
    throw error;
  }
}

// Update course content
export async function updateCourseContent(topics, learningObjectives, aiScope) {
  try {
    await sql`
      INSERT INTO course_content (topics, learning_objectives, ai_scope, updated_at)
      VALUES (${JSON.stringify(topics)}, ${JSON.stringify(learningObjectives)}, ${aiScope}, NOW())
    `;
    return { success: true };
  } catch (error) {
    console.error('Error updating course content:', error);
    throw error;
  }
}

// Get current PDF filename
export async function getCurrentPdfFilename() {
  try {
    const { rows } = await sql`
      SELECT filename 
      FROM course_files 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    return rows.length > 0 ? rows[0].filename : 'lecture9.pdf';
  } catch (error) {
    console.error('Error getting PDF filename:', error);
    return 'lecture9.pdf';
  }
}

// Save PDF file - STORE AS BASE64
export async function savePdfFile(filename, fileBuffer, contentType = 'application/pdf') {
  try {
    // Convert buffer to base64 string
    const base64Data = fileBuffer.toString('base64');
    
    await sql`
      INSERT INTO course_files (filename, file_data, content_type, uploaded_at)
      VALUES (${filename}, ${base64Data}, ${contentType}, NOW())
    `;
    return { success: true };
  } catch (error) {
    console.error('Error saving PDF file:', error);
    throw error;
  }
}

// Get PDF file - DECODE FROM BASE64
export async function getPdfFile() {
  try {
    const { rows } = await sql`
      SELECT filename, file_data, content_type 
      FROM course_files 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      console.log('No PDF found in database');
      return null;
    }
    
    console.log('PDF found:', rows[0].filename);
    
    // Convert base64 string back to buffer
    const buffer = Buffer.from(rows[0].file_data, 'base64');
    
    return {
      filename: rows[0].filename,
      data: buffer,
      contentType: rows[0].content_type || 'application/pdf'
    };
  } catch (error) {
    console.error('Error getting PDF file:', error);
    throw error;
  }
}

// Initialize database with default data
export async function initializeDatabase() {
  try {
    // Change file_data from BYTEA to TEXT to store base64
    await sql`
      CREATE TABLE IF NOT EXISTS course_content (
        id SERIAL PRIMARY KEY,
        topics JSONB NOT NULL,
        learning_objectives JSONB NOT NULL,
        ai_scope TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS course_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_data TEXT NOT NULL,
        content_type VARCHAR(100) DEFAULT 'application/pdf',
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    const { rows } = await sql`SELECT COUNT(*) as count FROM course_content`;
    
    if (rows[0].count === '0') {
      await sql`
        INSERT INTO course_content (topics, learning_objectives, ai_scope)
        VALUES (
          '[]'::jsonb,
          '["Understand fundamental programming concepts"]'::jsonb,
          'You are a helpful teaching assistant for COMP1010 - Introduction to Programming.'
        )
      `;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}