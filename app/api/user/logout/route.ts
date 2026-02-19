import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '../../utils/activityLogger';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';

async function handler(req: AuthenticatedRequest) {
  // Log logout activity if user is present
  if (req.user) {
    await logActivity({
      type: 'user_logout',
      userId: req.user.id,
      userName: req.user.username || '',
      userEmail: req.user.email || '',
      action: 'User logged out',
    });
  }
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );
  response.cookies.set('authToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}

export function POST(req: NextRequest) {
  return withAuth(req, handler);
}
