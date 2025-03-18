import { BoardModel } from '@/models/board.model';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const boards = await BoardModel.find()
      .populate('owner', '_id email name')
      .populate('members', '_id email name');

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const board = await BoardModel.create(body);

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
