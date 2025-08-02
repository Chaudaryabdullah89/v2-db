import mongoose from 'mongoose';
import Passcode from '../models/passcode.model.js';
import dotenv from 'dotenv';
dotenv.config();
const addTestPasscode = async () => {
  try {
    // Connect to MongoDB
    console.log('Mongo URI:', process.env.MONGO_URL);
    await mongoose.connect('mongodb+srv://chabdullah:abdullah21@backend.tr2ys.mongodb.net/?retryWrites=true&w=majority&appName=backend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create a test passcode
    const testPasscode = new Passcode({
      passcode: '123456'
    });

    await testPasscode.save();
    console.log('Test passcode added successfully: 123456');

    // List all passcodes
    const allPasscodes = await Passcode.find({});
    console.log('All passcodes in database:', allPasscodes.map(p => p.passcode));

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

addTestPasscode(); 