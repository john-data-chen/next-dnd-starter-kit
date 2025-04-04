'use server';

import { connect, connection, ConnectOptions } from 'mongoose';

let isConnected = false;
let dbUrl: string;

// Check environment variables
try {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'Production DATABASE_URL is not defined'
        : 'Database connection error:\n' +
          '1. Please check if MongoDB service is running\n' +
          '2. Verify docker-compose up -d has been executed\n' +
          '3. Confirm DATABASE_URL is properly configured in .env file'
    );
  }
  dbUrl = process.env.DATABASE_URL;
  console.log('Database URL:', dbUrl);
} catch (error) {
  console.error('\x1b[31mDatabase URL configuration error:', error, '\x1b[0m');
  throw error;
}

// Atlas configuration for production
const clientOptions: ConnectOptions =
  process.env.NODE_ENV === 'production'
    ? {
        serverApi: {
          version: '1' as const,
          strict: true,
          deprecationErrors: true
        }
      }
    : {};

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    console.log('Connecting to MongoDB...');

    await connect(dbUrl!, {
      ...clientOptions,
      serverSelectionTimeoutMS: 5000
    });

    // Only verify connection in production
    if (process.env.NODE_ENV === 'production') {
      if (connection.db) {
        await connection.db.admin().command({ ping: 1 });
      } else {
        throw new Error('Database connection not established');
      }
    }

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
