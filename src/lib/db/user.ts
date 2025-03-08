'use server';

import { UserModel } from '@/models/user.model';
import { connectToDatabase } from './connect';

export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      console.error('User not found');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      console.error('User not found');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
