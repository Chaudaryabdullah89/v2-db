import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
import blogroute from './routes/blog.route.js';
import PasscodeRoute from './routes/passcode.route.js';
import adminRoute from './routes/admin.route.js';

import connecttodb from './config/db.config.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connecttodb();

app.use(cors({
  origin: ['https://retrosmart-v2.vercel.app', 'http://localhost:5173', 'https://v2-db.vercel.app', '*'], // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));




app.get('/', (req, res) => {
  res.send('Good Back from Retro-BD');
});

app.use('/api', blogroute);
app.use('/api/verification', PasscodeRoute);
app.use('/api/admin', adminRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
