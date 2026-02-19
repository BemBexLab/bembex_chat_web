import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Admin from '../../models/Admin';

const generateConversationId = (id1: string, id2: string) => {
  const ids = [id1.toString(), id2.toString()].sort();
  return `${ids[0]}-${ids[1]}`;
};

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;

    const admin = await Admin.findOne().select('_id email');

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Admin retrieved successfully',
        admin: {
          _id: admin._id?.toString(),
          email: admin.email,
          conversationId: generateConversationId(userId!, admin._id?.toString() || ''),
        },
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

export async function GET(req: NextRequest) {
  return withAuth(req, handler);
}
