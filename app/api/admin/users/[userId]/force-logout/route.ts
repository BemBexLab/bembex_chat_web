import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { connectDB } from '../../../../utils/database';
import User from '../../../../models/User';
import { logActivity } from '../../../../utils/activityLogger';

async function handler(req: AuthenticatedRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    await connectDB();

    if (req.user?.type !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    if (req.method !== 'POST') {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.forceLogoutAt = new Date();
    await user.save();

    // Log as a logout activity for feed purposes
    try {
      await logActivity({
        type: 'user_logout',
        userId: user._id.toString(),
        userName: user.username,
        userEmail: user.email,
        action: `Force logout by admin ${req.user?.id}`,
      });
    } catch (err) {
      console.error('Failed to log forced logout', err);
    }

    // If a socket server is present, emit a force_logout to the user's room
    try {
      const io: any = (global as any).__io;
      let socketRoomSize = 0;
      if (io) {
        const room = io.sockets.adapter.rooms.get(user._id.toString());
        socketRoomSize = room ? room.size : 0;
        io.to(user._id.toString()).emit('force_logout', {
          message: 'You have been forcefully logged out by an administrator',
        });
      }

      return NextResponse.json({ message: 'User has been forcefully logged out', socketRoomSize }, { status: 200 });
    } catch (emitErr) {
      console.error('Failed to emit force_logout event', emitErr);
      return NextResponse.json({ message: 'User has been forcefully logged out' }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
