import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { connectDB } from '../../../../utils/database';
import Chat from '../../../../models/Chat';

const getFullFileUrl = (relativeUrl: string, req: NextRequest) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const protocol = req.nextUrl.protocol.replace(':', '');
  const host = req.nextUrl.host;
  return `${protocol}://${host}${relativeUrl}`;
};

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId1: string; userId2: string }> }
) {
  try {
    const { userId1, userId2 } = await params;
    await connectDB();

    const userType = req.user?.type;

    if (userType !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    // Create conversation ID (order-independent)
    const conversationId =
      userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;

    const [messages, total] = await Promise.all([
      Chat.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Chat.countDocuments({ conversationId }),
    ]);

    const messagesWithFullUrls = messages.map((msg) => ({
      ...msg,
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId1: string; userId2: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
