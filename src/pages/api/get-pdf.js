import { getPdfFile } from '../../lib/db';

export const config = {
  api: {
    responseLimit: '50mb',
  },
};

export default async function handler(req, res) {
  try {
    console.log('=== GET-PDF REQUEST ===');
    console.log('Method:', req.method);
    
    const pdfData = await getPdfFile();
    
    if (!pdfData) {
      console.log('No PDF found');
      res.status(404).send('No PDF found');
      return;
    }
    
    const buffer = pdfData.data;
    console.log('Buffer length:', buffer.length);
    
    // Verify PDF header
    const header = buffer.slice(0, 4).toString();
    console.log('PDF header:', header);
    
    if (!header.startsWith('%PDF')) {
      console.error('Invalid PDF data');
      res.status(500).send('Invalid PDF data');
      return;
    }
    
    // Prevent caching during development
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${pdfData.filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log('Sending PDF...');
    res.status(200).end(buffer);
    console.log('=== PDF SENT ===');
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
}