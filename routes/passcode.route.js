import express from 'express';
const router = express.Router();
import Passcode from '../models/passcode.model.js'; // Assuming you have a Passcode model

router.post('/passcode', async (req, res) => {
  console.log('[POST /passcode] Incoming request received.');
  console.log('[POST /passcode] Headers:', req.headers);
  console.log('[POST /passcode] Request body:', req.body);

  const { passcode } = req.body;
  console.log('[POST /passcode] Extracted passcode:', passcode);
  console.log('[POST /passcode] Passcode type:', typeof passcode);

  // Validation
  if (!passcode || typeof passcode !== 'string' || passcode.trim().length === 0) {
    console.warn('[POST /passcode] Passcode is missing or invalid.');
    return res.status(400).json({ success: false, message: 'Passcode is required' });
  }

  try {
    console.log(`[POST /passcode] Checking passcode in DB: "${passcode}"`);

    // Convert passcode to string for comparison
    const passcodeString = passcode.toString();
    
    const storedPasscode = await Passcode.findOne({ passcode: passcodeString });

    if (!storedPasscode) {
      console.warn('[POST /passcode] Passcode not found in database.');
      return res.status(400).json({ success: false, message: 'Invalid passcode' });
    }

    console.log('[POST /passcode] Passcode verified successfully.');
    const adminToken = process.env.ADMIN_TOKEN ;
    return res.status(200).json({ 
      success: true, 
      message: 'Passcode verified',
      token: adminToken
    });
  } catch (error) {
    console.error('[POST /passcode] Error verifying passcode:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Test endpoint to check database connection
router.get('/test', async (req, res) => {
  try {
    const passcodes = await Passcode.find({});
    res.json({ 
      success: true, 
      message: 'Database connection working',
      passcodes: passcodes.map(p => p.passcode)
    });
  } catch (error) {
    console.error('[GET /test] Error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

export default router;