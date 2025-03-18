import { BoardModel } from '@/models/board.model';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await BoardModel.findById(params.boardId)
      .populate('owner', '_id email name')
      .populate('members', '_id email name')
      .populate('projects');

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const body = await request.json();
    const board = await BoardModel.findByIdAndUpdate(params.boardId, body, {
      new: true
    }).populate('owner members projects');

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await BoardModel.findByIdAndDelete(params.boardId);

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
