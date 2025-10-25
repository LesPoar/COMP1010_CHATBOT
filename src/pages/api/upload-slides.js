import formidable from 'formidable';
import fs from 'fs';
import { sql } from '@vercel/postgres';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.headers;
  if (token !== 'authenticated') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const form = formidable({
    maxFileSize: 50 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error uploading file' });
    }

    try {
      const file = files.file[0];
      
      console.log('=== UPLOAD V2 START ===');
      console.log('Mimetype:', file.mimetype);
      console.log('Size:', file.size);
      
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return res.status(400).json({ message: 'Only PDF files are allowed' });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      console.log('Buffer length:', fileBuffer.length);
      
      // Verify PDF
      const header = fileBuffer.slice(0, 4).toString();
      console.log('PDF header:', header);
      
      if (!header.startsWith('%PDF')) {
        return res.status(400).json({ message: 'Invalid PDF file' });
      }

      // Convert to base64 EXPLICITLY
      const base64String = fileBuffer.toString('base64');
      console.log('Base64 string length:', base64String.length);
      console.log('Base64 first 50 chars:', base64String.substring(0, 50));

      const timestamp = Date.now();
      const filename = `lecture-${timestamp}.pdf`;
      
      console.log('Inserting into database...');
      
      // Direct SQL insert with explicit base64 text
      await sql`
        INSERT INTO course_files (filename, file_data, content_type, uploaded_at)
        VALUES (${filename}, ${base64String}, ${file.mimetype}, NOW())
      `;
      
      console.log('Inserted successfully!');
      
      // Verify what was stored
      const { rows } = await sql`
        SELECT 
          filename, 
          content_type,
          LENGTH(file_data) as data_length,
          SUBSTRING(file_data, 1, 50) as data_preview
        FROM course_files 
        WHERE filename = ${filename}
      `;
      
      console.log('Verification:', rows[0]);
      console.log('=== UPLOAD V2 END ===');

      fs.unlinkSync(file.filepath);

      return res.status(200).json({ 
        success: true, 
        filename: filename,
        message: 'File uploaded successfully',
        verification: rows[0]
      });
    } catch (error) {
      console.error('=== UPLOAD V2 ERROR ===');
      console.error('Error:', error);
      return res.status(500).json({ 
        message: 'Error processing file',
        error: error.message 
      });
    }
  });
}