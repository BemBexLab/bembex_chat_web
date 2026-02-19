import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { connectDB } from '../../../utils/database';
import Chat from '../../../models/Chat';
import mongoose from 'mongoose';

const getFullFileUrl = (relativeUrl: string, req: NextRequest) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const protocol = req.nextUrl.protocol.replace(':', '');
  const host = req.nextUrl.host;
  return `${protocol}://${host}${relativeUrl}`;
};

async function handler(req: AuthenticatedRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    await connectDB();
    const userId = req.user?.id;
    const userType = req.user?.type;
    
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    if (userType === 'user' && req.user?.isSuspended) {
      return NextResponse.json(
        { message: 'Your account is suspended' },
        { status: 403 }
      );
    }

    // Verify user is part of this conversation
    const conversationParts = conversationId.split('-');
    const isPartOfConversation =
      conversationParts.includes(userId?.toString() || '') ||
      conversationId.includes(userId?.toString() || '');

    if (!isPartOfConversation) {
      return NextResponse.json(
        { message: 'You do not have access to this conversation' },
        { status: 403 }
      );
    }

    const [messages, total] = await Promise.all([
      Chat.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Chat.countDocuments({ conversationId }),
    ]);

    // Mark messages as read
    const userObjectId = new mongoose.Types.ObjectId(userId);
    Chat.updateMany(
      { conversationId, receiverId: userObjectId, isRead: false },
      { isRead: true }
    ).catch(err => console.error('Mark as read error:', err));

    const messagesWithFullUrls = messages.map(msg => ({
      ...msg,
      _id: (msg as any)._id?.toString?.() || (msg as any)._id,
      senderId: (msg as any).senderId?.toString?.() || (msg as any).senderId,
      receiverId: (msg as any).receiverId?.toString?.() || (msg as any).receiverId,
      fileUrl: (msg as any).fileUrl ? getFullFileUrl((msg as any).fileUrl, req) : null,
    }));

    return NextResponse.json(
      {
        message: 'Conversation retrieved successfully',
        conversationId,
        messages: messagesWithFullUrls.reverse(),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
