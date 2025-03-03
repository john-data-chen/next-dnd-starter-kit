import { UserModel } from '@/models/user.model';
import { connectToDatabase } from './connect';

export async function getUserFromDb(email: string) {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email });
    return user?._id.toString();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
