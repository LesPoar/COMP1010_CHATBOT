import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
    uploadDir: path.join(process.cwd(), 'public'),
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error uploading file' });
    }

    try {
      const file = files.file[0];
      const oldPath = file.filepath;
      const newFilename = 'lecture9.pdf'; // Or use dynamic naming
      const newPath = path.join(process.cwd(), 'public', newFilename);

      // Move and rename the file
      fs.renameSync(oldPath, newPath);

      // Update courseData.json with new filename
      const dataFilePath = path.join(process.cwd(), 'data', 'courseData.json');
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContents);
      data.slidesFilename = newFilename;
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

      return res.status(200).json({ 
        success: true, 
        filename: newFilename,
        message: 'File uploaded successfully' 
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      return res.status(500).json({ message: 'Error processing file' });
    }
  });
}