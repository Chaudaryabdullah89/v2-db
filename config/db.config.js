import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connecttodb = async () => {
  try {
    console.log('=== DATABASE CONNECTION START ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Mongo URI exists:', !!process.env.MONGO_URL);
    console.log('Mongo URI (first 50 chars):', process.env.MONGO_URL ? process.env.MONGO_URL.substring(0, 50) + '...' : 'NOT SET');
    
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL environment variable is not set');
    }
    
    console.log('Attempting to connect to MongoDB...');
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    };
    
    console.log('Connection options:', connectionOptions);
    
    await mongoose.connect(process.env.MONGO_URL, connectionOptions);
    
    console.log('MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    console.log('=== DATABASE CONNECTION END ===');
    
    // Add connection event listeners for debugging
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('=== DATABASE CONNECTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('=== END DATABASE CONNECTION ERROR ===');
    throw error; // Re-throw to handle in server.js
  }
};

export default connecttodb;