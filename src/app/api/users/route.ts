import { UserModel } from '@/models/user.model';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await UserModel.find().select('_id email name');
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
