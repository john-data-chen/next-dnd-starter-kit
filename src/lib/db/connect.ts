import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    let dbUrl = process.env.DATABASE_URL;
    if (!process.env.DATABASE_URL) {
      dbUrl =
        'mongodb://root:123456@localhost:27017/next-template?authSource=admin';
    }

    console.log('DATABASE_URL:', dbUrl);
    const mongoose = (await import('mongoose')).default;
    await mongoose.connect(dbUrl!);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}
