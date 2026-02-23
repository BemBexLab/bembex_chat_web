import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { connectDB } from '../../../utils/database';
import User from '../../../models/User';
import Chat from '../../../models/Chat';

const formatUserForFrontend = (user: any) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  type: user.type,
  status: user.suspended ? 'suspended' : 'active',
  isActive: user.isActive,
  suspended: user.suspended,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    await connectDB();

    const userType = req.user?.type;

    if (userType !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (req.method === 'GET') {
      const user = await User.findById(userId).select('-password -__v').lean();

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'User retrieved successfully',
          user: formatUserForFrontend(user),
        },
        { status: 200 }
      );
    }

    if (req.method === 'PUT') {
      const { username, phone, email, status } = await req.json();

      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      if (username) user.username = username;
      if (phone) user.phone = phone;
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return NextResponse.json(
            { message: 'Email already in use' },
            { status: 400 }
          );
        }
        user.email = email;
      }

      // Handle status change (active/suspended)
      if (status) {
        if (status === 'suspended') {
          user.suspended = true;
          // notify via socket if connected
          try {
            const io: any = (global as any).__io;
            if (io) {
              io.to(user._id.toString()).emit('user_suspended', {
                message: 'Your account has been suspended by an admin',
              });
            }
          } catch (e) {
            console.error('Failed to emit user_suspended event', e);
          }
        } else if (status === 'active') {
          user.suspended = false;
        }
      }

      await user.save();

      return NextResponse.json(
        {
          message: 'User updated successfully',
          user: formatUserForFrontend(user),
        },
        { status: 200 }
      );
    }

    if (req.method === 'DELETE') {
      const existingUser = await User.findById(userId).select('_id');
      if (!existingUser) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      const deletedChats = await Chat.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
      });

      const user = await User.findByIdAndDelete(userId);

      return NextResponse.json(
        {
          message: 'User deleted successfully',
          deletedChatsCount: deletedChats.deletedCount || 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
