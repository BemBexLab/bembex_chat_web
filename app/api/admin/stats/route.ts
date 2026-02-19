import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';
import Chat from '../../models/Chat';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userType = req.user?.type;

    if (userType !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const [totalUsers, suspendedUsers, activeUsers, totalMessages, uniqueConversations] = await Promise.all([
      User.countDocuments({ type: 'user' }),
      User.countDocuments({ type: 'user', isSuspended: true }),
      User.countDocuments({ type: 'user', isActive: true }),
      Chat.countDocuments(),
      Chat.find({}, 'conversationId')
        .distinct('conversationId')
        .then((ids: string[]) => ids.length),
    ]);

    return NextResponse.json(
      {
        message: 'Dashboard stats retrieved successfully',
        stats: {
          totalUsers,
          suspendedUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalMessages,
          uniqueConversations,
        },
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
