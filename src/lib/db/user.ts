import { User } from '@/models/user.model';
import { connectToDatabase } from './connect';

export async function getUserFromDb(email: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
