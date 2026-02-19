import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import User from '../../models/User';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Old and new passwords are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, handler);
}
