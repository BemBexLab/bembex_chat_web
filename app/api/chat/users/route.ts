import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';

const generateConversationId = (id1: string, id2: string) => {
  const ids = [id1.toString(), id2.toString()].sort();
  return `${ids[0]}-${ids[1]}`;
};

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;
    const page = Math.max(1, parseInt(new URL(req.url).searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(new URL(req.url).searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('_id username email createdAt suspended')
        .sort({ username: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ isActive: true }),
    ]);

    const usersWithConversations = users.map((user) => ({
      _id: user._id?.toString(),
      username: user.username,
      email: user.email,
      conversationId: generateConversationId(userId!, user._id?.toString() || ''),
    }));

    return NextResponse.json(
      {
        message: 'Users retrieved successfully',
        total,
        users: usersWithConversations,
        pagination: { page, limit, pages: Math.ceil(total / limit) },
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
