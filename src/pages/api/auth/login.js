export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;
  
  // In production, use environment variables and proper authentication
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'professor123';

  if (password === ADMIN_PASSWORD) {
    // In production, use proper JWT tokens or sessions
    return res.status(200).json({ 
      success: true, 
      token: 'authenticated' // Simple token for demo
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid password' });
}