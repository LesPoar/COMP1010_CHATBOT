import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Check if table exists and has data
    const { rows } = await sql`
      SELECT filename, content_type, LENGTH(file_data) as file_size, uploaded_at
      FROM course_files 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        message: 'No PDF files found in database',
        hasData: false
      });
    }
    
    return res.status(200).json({
      message: 'PDF found',
      hasData: true,
      filename: rows[0].filename,
      contentType: rows[0].content_type,
      fileSize: rows[0].file_size,
      uploadedAt: rows[0].uploaded_at
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Database error',
      error: error.message 
    });
  }
}