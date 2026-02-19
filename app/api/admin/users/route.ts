import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import { logActivity } from '../../utils/activityLogger';
import User from '../../models/User';

const formatUserForFrontend = (user: any) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    status: user.suspended ? 'suspended' : (user.isActive ? 'active' : 'suspended'),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
  };
};

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    // Only admin can access
    if (req.user?.type !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!req.user?.id) {
      return NextResponse.json(
        { message: 'Invalid admin token: missing admin id' },
        { status: 401 }
      );
    }

    if (req.method === 'GET') {
      const users = await User.find({}).select('-password');
      const formattedUsers = users.map(formatUserForFrontend);

      return NextResponse.json(
        {
          message: 'Users retrieved successfully',
          total: formattedUsers.length,
          users: formattedUsers,
        },
        { status: 200 }
      );
    }

    if (req.method === 'POST') {
      const { email, password, username } = await req.json();

      if (!email || !password || !username) {
        return NextResponse.json(
          { message: 'Email, password, and username are required' },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 }
        );
      }

      const user = new User({
        email,
        password,
        username,
        createdBy: req.user.id,
        lastLogin: null,
      });

      await user.save();

      // Log activity
      await logActivity({
        type: 'user_created',
        userId: user._id.toString(),
        userName: user.username,
        userEmail: user.email,
        action: 'New user registered',
        details: { createdBy: req.user?.id },
        performedBy: req.user?.id,
      });

      return NextResponse.json(
        {
          message: 'User created successfully',
          user: formatUserForFrontend(user),
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error?.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { message: `${duplicateField} already exists` },
        { status: 400 }
      );
    }

    if (error?.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0] as { message?: string } | undefined;
      return NextResponse.json(
        { message: firstError?.message || 'Invalid user data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, handler);
}

export async function POST(req: NextRequest) {
  return withAuth(req, handler);
}
