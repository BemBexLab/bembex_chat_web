import { NextRequest } from 'next/server';
import { verifyToken } from '../utils/jwtUtils';
import { connectDB } from '../utils/database';
import User from '../models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    type: string;
    isSuspended?: boolean;
    username?: string;
    email?: string;
  };
}

export async function withAuth(req: NextRequest, handler: (req: AuthenticatedRequest) => Promise<Response>) {
  try {
    await connectDB();


    // Prefer admin auth sources first to avoid using a regular user's cookie when
    // an admin token is provided via header or cookie (common in admin UI).
    // Order: Authorization header -> admin_token cookie -> authToken cookie
    let token = null as string | null;
    if (req.headers.get('authorization')) {
      token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    }
    if (!token) {
      token = req.cookies.get('admin_token')?.value || null;
    }
    if (!token) {
      token = req.cookies.get('authToken')?.value || null;
    }

    if (!token) {
      return new Response(JSON.stringify({ message: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded: any = verifyToken(token);

    if (!decoded) {
      return new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedId = decoded.id || decoded._id || decoded.userId || decoded.sub;
    if (!normalizedId) {
      return new Response(JSON.stringify({ message: 'Invalid token payload: missing user id' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    decoded.id = String(normalizedId);

    // Check suspension status for users
    if (decoded.type === 'user') {
      const userDoc: any = await User.findById(decoded.id).select('suspended isActive forceLogoutAt');

      if (userDoc && (userDoc.suspended || !userDoc.isActive)) {
        decoded.isSuspended = true;
      }

      // If admin forced logout after token was issued, reject token
      if (userDoc && userDoc.forceLogoutAt) {
        const tokenIat = (decoded as any).iat;
        if (tokenIat && tokenIat < Math.floor(new Date(userDoc.forceLogoutAt).getTime() / 1000)) {
          return new Response(JSON.stringify({ message: 'Token invalidated by admin' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    (req as AuthenticatedRequest).user = decoded;

    return handler(req as AuthenticatedRequest);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: 'Authentication failed', error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
