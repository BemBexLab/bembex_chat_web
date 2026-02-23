import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';
import Admin from '../../models/Admin';

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

    let admins: any[] = [];
    // Allow regular users to find admin(s) in the same search bar and start chats.
    if (req.user?.type === 'user') {
      admins = await Admin.find({
        email: { $regex: query, $options: 'i' },
      })
        .select('_id email')
        .limit(5)
        .lean();

      // If query looks like "admin", include admins even when email doesn't match literally.
      if (admins.length === 0 && /admin/i.test(query)) {
        admins = await Admin.find({})
          .select('_id email')
          .limit(5)
          .lean();
      }
    }

    const mappedUsers = users.map((user: any) => ({
      id: user._id?.toString?.() || user._id,
      _id: user._id?.toString?.() || user._id,
      username: user.username,
      email: user.email,
    }));

    const mappedAdmins = admins.map((admin: any) => {
      const email = admin.email || '';
      const emailPrefix = String(email).split('@')[0] || 'admin';
      return {
        id: admin._id?.toString?.() || admin._id,
        _id: admin._id?.toString?.() || admin._id,
        username: emailPrefix,
        email,
      };
    });

    const uniqueById = new Map<string, any>();
    [...mappedUsers, ...mappedAdmins].forEach((entry) => {
      const id = entry.id?.toString?.() || '';
      if (id && !uniqueById.has(id)) {
        uniqueById.set(id, entry);
      }
    });

    return NextResponse.json(
      {
        message: 'Users found',
        users: Array.from(uniqueById.values()),
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
