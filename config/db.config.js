import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connecttodb = async () => {
  try {
    console.log('Mongo URI:', process.env.MONGO_URL );
    await mongoose.connect(process.env.MONGO_URL, {
   
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connecttodb;