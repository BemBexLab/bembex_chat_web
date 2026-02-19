import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { connectDB } from '../../../utils/database';
import Chat from '../../../models/Chat';

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    await connectDB();

    const userId = req.user?.id;

    const chat = await Chat.findById(messageId);

    if (!chat) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    // Only sender can delete their message
    if (chat.senderId.toString() !== userId?.toString()) {
      return NextResponse.json(
        { message: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    await Chat.findByIdAndDelete(messageId);

    return NextResponse.json(
      { message: 'Message deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
