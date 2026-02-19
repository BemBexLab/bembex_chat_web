import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { connectDB } from '../../../../utils/database';
import Chat from '../../../../models/Chat';
import mongoose from 'mongoose';

async function handler(req: AuthenticatedRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    await connectDB();

    const userId = req.user?.id;
    const userType = req.user?.type;

    // Prevent suspended users from marking messages as read
    if (userType === 'user' && req.user?.isSuspended) {
      return NextResponse.json(
        { message: 'Your account is suspended and cannot perform this action' },
        { status: 403 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Chat.updateMany(
      { conversationId, receiverId: userObjectId, isRead: false },
      { isRead: true }
    );

    return NextResponse.json(
      {
        message: 'Messages marked as read',
        modifiedCount: result.modifiedCount,
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
