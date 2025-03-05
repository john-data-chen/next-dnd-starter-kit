'use server';

import { defaultDbUrl } from '@/constants/auth';
import { connect } from 'mongoose';

let isConnected = false;
let dbUrl = process.env.DATABASE_URL;
if (!process.env.DATABASE_URL) {
  dbUrl = defaultDbUrl;
}

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    console.log('DATABASE_URL:', dbUrl);
    await connect(dbUrl!);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
