import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';

const getFullFileUrl = (relativeUrl: string, req: NextRequest) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const protocol = req.nextUrl.protocol.replace(':', '');
  const host = req.nextUrl.host;
  return `${protocol}://${host}${relativeUrl}`;
};

// GET /api/admin/chats?user1=USERID1&user2=USERID2
export async function GET(req: NextRequest) {
  await connectDB();
  // Only admin can access
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    if (authReq.user?.type !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');
    if (!user1 || !user2) {
      return NextResponse.json({ message: 'Both user1 and user2 are required' }, { status: 400 });
    }
    // Create conversation ID using sorted user IDs (order-independent)
    const ids = [user1, user2].sort();
    const conversationId = `${ids[0]}-${ids[1]}`;
    // Find all chats for this conversation without validating user existence
    const chats = await Chat.find({
      conversationId
    }).sort({ createdAt: 1 }).lean();
    
    // Add full file URLs
    const chatsWithUrls = chats.map((msg) => ({
      ...msg,
      fileUrl: msg.fileUrl ? getFullFileUrl(msg.fileUrl, req) : null,
    }));
    
    return NextResponse.json({
      message: 'Chats retrieved',
      chats: chatsWithUrls,
    });
  });
}
