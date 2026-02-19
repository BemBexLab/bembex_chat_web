import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';
import mongoose from 'mongoose';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const unreadCount = await Chat.countDocuments({
      receiverId: userObjectId,
      isRead: false,
    });

    return NextResponse.json(
      {
        message: 'Unread count retrieved',
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, handler);
}
