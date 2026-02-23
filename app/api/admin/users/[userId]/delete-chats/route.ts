import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { connectDB } from '../../../../utils/database';
import User from '../../../../models/User';
import Chat from '../../../../models/Chat';

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    await connectDB();

    if (req.user?.type !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    if (req.method !== 'POST') {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }

    const user = await User.findById(userId).select('_id username email');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const deleted = await Chat.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    return NextResponse.json(
      {
        message: 'User chats deleted successfully',
        deletedChatsCount: deleted.deletedCount || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
