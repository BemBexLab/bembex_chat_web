import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Activity from '../../models/Activity';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();
    if (req.user?.type !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }
    const limit = 10;
    const activities = await Activity.find({ type: { $in: ['user_login', 'user_logout'] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('type userId userName userEmail action createdAt')
      .lean();
    const formattedActivities = activities.map((activity: any) => ({
      id: activity._id.toString(),
      type: activity.type,
      user: activity.userName,
      userEmail: activity.userEmail,
      action: activity.action,
      timestamp: activity.createdAt,
      time: getRelativeTime(activity.createdAt),
    }));
    return NextResponse.json({ message: 'Recent activities retrieved successfully', activities: formattedActivities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

export function GET(req: NextRequest) {
  return withAuth(req, handler);
}