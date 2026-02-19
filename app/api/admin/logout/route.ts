import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '../../utils/activityLogger';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import Admin from '../../models/Admin';

async function handler(req: AuthenticatedRequest) {
  // Log logout activity if admin is present
  if (req.user) {
    // Fetch admin details from DB since not present on token
    let userName = '';
    let userEmail = '';
    try {
      const adminDoc = await Admin.findById(req.user.id).select('username email');
      if (adminDoc) {
        userName = adminDoc.username || '';
        userEmail = adminDoc.email || '';
      }
    } catch {}
    await logActivity({
      type: 'user_logout',
      userId: req.user.id,
      userName,
      userEmail,
      action: 'Admin logged out',
    });
  }
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export function POST(req: NextRequest) {
  return withAuth(req, handler);
}
