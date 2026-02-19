import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../utils/database';
import { generateToken } from '../../utils/jwtUtils';
import Admin from '../../models/Admin';
import { logActivity } from '../../utils/activityLogger';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(admin._id.toString(), 'admin');

    // Log admin login activity
    await logActivity({
      type: 'user_login',
      userId: admin._id.toString(),
      userName: admin.username || '',
      userEmail: admin.email || '',
      action: 'Admin logged in',
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      },
      { status: 200 }
    );

    response.cookies.set('admin_token', token, {
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
