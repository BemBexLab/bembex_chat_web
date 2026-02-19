import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { message: 'Search query must be at least 2 characters', users: [] },
        { status: 200 }
      );
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user?.id }, // Exclude current user
      isActive: true,
      suspended: false,
    })
      .select('_id username email')
      .limit(20)
      .lean();

    return NextResponse.json(
      {
        message: 'Users found',
        users: users.map((user: any) => ({
          id: user._id?.toString?.() || user._id,
          _id: user._id?.toString?.() || user._id,
          username: user.username,
          email: user.email,
        })),
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
