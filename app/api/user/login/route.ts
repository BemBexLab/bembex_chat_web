import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../utils/database';
import { generateToken } from '../../utils/jwtUtils';
import { logActivity } from '../../utils/activityLogger';
import User from '../../models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: 'Your account is inactive' }, { status: 403 });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user._id.toString(), 'user');

    // Log activity
    await logActivity({
      type: 'user_login',
      userId: user._id.toString(),
      userName: user.username,
      userEmail: user.email,
      action: 'User logged in',
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          suspended: user.suspended || false,
        },
      },
      { status: 200 }
    );

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
