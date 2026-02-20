import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { connectDB } from '../../../utils/database';
import Chat from '../../../models/Chat';

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    await connectDB();
    const { messageId } = await params;
    const userId = req.user?.id;
    const userType = req.user?.type;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ message: 'Invalid message ID' }, { status: 400 });
    }

    const message = (await Chat.findById(messageId)
      .select('+fileData fileName fileType senderId receiverId fileSize')) as any;

    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    if (!message.fileData) {
      return NextResponse.json({ message: 'File not found for this message' }, { status: 404 });
    }

    if (userType !== 'admin') {
      const senderId = (message.senderId as any)?.toString?.() || String(message.senderId);
      const receiverId = (message.receiverId as any)?.toString?.() || String(message.receiverId);
      if (!userId || (userId !== senderId && userId !== receiverId)) {
        return NextResponse.json({ message: 'Access denied' }, { status: 403 });
      }
    }

    let fileBuffer: Buffer | null = null;
    const raw = message.fileData as any;
    if (Buffer.isBuffer(raw)) {
      fileBuffer = raw;
    } else if (raw?.buffer && Buffer.isBuffer(raw.buffer)) {
      fileBuffer = raw.buffer;
    } else if (raw?.type === 'Buffer' && Array.isArray(raw?.data)) {
      fileBuffer = Buffer.from(raw.data);
    } else if (Array.isArray(raw?.data)) {
      fileBuffer = Buffer.from(raw.data);
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ message: 'Invalid file data' }, { status: 500 });
    }

    const mimeType = message.fileType || 'application/octet-stream';
    const fileName = (message.fileName || 'attachment').replace(/["\r\n]/g, '');
    const isInline =
      mimeType.startsWith('image/') ||
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('video/') ||
      mimeType === 'application/pdf';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${fileName}"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  return withAuth(req, (authReq) => handler(authReq, { params }));
}
