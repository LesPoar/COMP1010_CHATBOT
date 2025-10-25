import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        filename, 
        content_type,
        LENGTH(file_data) as file_size,
        uploaded_at,
        SUBSTRING(encode(file_data, 'base64'), 1, 50) as data_preview
      FROM course_files 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        status: 'no_data',
        message: 'No PDF files found in database'
      });
    }
    
    // Try to get the actual data
    const { rows: dataRows } = await sql`
      SELECT file_data
      FROM course_files 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const fileData = dataRows[0].file_data;
    
    return res.status(200).json({
      status: 'found',
      filename: rows[0].filename,
      contentType: rows[0].content_type,
      fileSize: rows[0].file_size,
      uploadedAt: rows[0].uploaded_at,
      dataType: typeof fileData,
      isBuffer: Buffer.isBuffer(fileData),
      isUint8Array: fileData instanceof Uint8Array,
      actualLength: fileData?.length,
      firstBytes: fileData?.slice(0, 10),
      dataPreview: rows[0].data_preview
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}