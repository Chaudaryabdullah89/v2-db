import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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






app.get('/', (req, res) => {
  res.send('Good Back from Retro-BD');
});

app.use('/api', blogroute);
app.use('/api/verification', PasscodeRoute);
app.use('/api/admin', adminRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
