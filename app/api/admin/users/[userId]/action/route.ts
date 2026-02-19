import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { connectDB } from '../../../../utils/database';
import { logActivity } from '../../../../utils/activityLogger';
import User from '../../../../models/User';

const formatUserForFrontend = (user: any) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  type: user.type,
  isActive: user.isActive,
  isSuspended: user.isSuspended,
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

    const { action } = await req.json();

    if (!action || !['suspend', 'unsuspend', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'suspend') {
      user.suspended = true;
    } else if (action === 'unsuspend') {
      user.suspended = false;
    } else if (action === 'activate') {
      user.isActive = true;
    } else if (action === 'deactivate') {
      user.isActive = false;
    }

    await user.save();

    // Log activity
    const actionMap: { [key: string]: { type: string; message: string } } = {
      suspend: { type: 'user_suspended', message: 'User suspended by admin' },
      unsuspend: { type: 'user_activated', message: 'User reactivated by admin' },
      activate: { type: 'user_updated', message: 'User activated' },
      deactivate: { type: 'user_updated', message: 'User deactivated' },
    };

    const activityInfo = actionMap[action];
    await logActivity({
      type: activityInfo.type as any,
      userId: user._id.toString(),
      userName: user.username,
      userEmail: user.email,
      action: activityInfo.message,
      details: { action },
      performedBy: req.user?.id,
    });

    return NextResponse.json(
      {
        message: `User ${action}ed successfully`,
        user: formatUserForFrontend(user),
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
