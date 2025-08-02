import express from 'express';
const router = express.Router();
import verifyMiddleware from '../middlewares/verifyMiddleware.js';

// Protected admin dashboard route
router.get('/dashboard', verifyMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to the admin dashboard!'
  });
});

// Auth verification endpoint
router.get('/auth/verify', verifyMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Token is valid',
    authenticated: true
  });
});

export default router; 