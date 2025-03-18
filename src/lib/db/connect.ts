'use server';

import { defaultDbUrl } from '@/constants/demoData';
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
    console.log('connecting to DATABASE_URL:', dbUrl);

    // Set connection timeout to avoid long waiting
    await connect(dbUrl!, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error: unknown) {
    isConnected = false;

    if (error instanceof Error) {
      // Provide more specific error messages based on error type
      if (error.name === 'MongoServerSelectionError') {
        console.error(
          'MongoDB connection failed: Database server not running or unreachable'
        );
        throw new Error(
          'Database server is not running or unreachable. Please verify MongoDB service is running properly.'
        );
      } else if (error.name === 'MongoNetworkError') {
        console.error(
          'MongoDB network error: Unable to connect to the database'
        );
        throw new Error(
          'Database network connection error. Please check network settings and database address.'
        );
      } else {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    } else {
      console.error('Unknown MongoDB connection error:', error);
      throw new Error(
        'An unknown error occurred while connecting to the database'
      );
    }
  }
}
