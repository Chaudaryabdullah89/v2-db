// Middleware to protect admin routes
const verifyMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  // For now, using a simple static token
  // In production, you should use JWT tokens with expiration
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin_secret_token_2024';

  if (!token || token !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access. Please verify your passcode first.' 
    });
  }

  next();
};

export default verifyMiddleware; 