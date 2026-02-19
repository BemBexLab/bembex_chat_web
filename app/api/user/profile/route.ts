import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const user = await User.findById(req.user?.id).select('-password');

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(
        { message: 'Profile retrieved successfully', user },
        { status: 200 }
      );
    }

    if (req.method === 'PUT') {
      const { username } = await req.json();

      if (!username) {
        return NextResponse.json(
          { message: 'Username is required' },
          { status: 400 }
        );
      }

      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { username },
        { new: true, runValidators: true }
      ).select('-password');

      return NextResponse.json(
        { message: 'Profile updated successfully', user },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
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

export async function PUT(req: NextRequest) {
  return withAuth(req, handler);
}
