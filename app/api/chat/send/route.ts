import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';
import User from '../../models/User';
import Admin from '../../models/Admin';
import mongoose from 'mongoose';

const generateConversationId = (id1: string, id2: string) => {
  const ids = [id1.toString(), id2.toString()].sort();
  return `${ids[0]}-${ids[1]}`;
};

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { receiverId, message } = await req.json();
    const senderId = req.user?.id;
    const senderType = req.user?.type;

    if (!senderId || !senderType) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        { message: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    let senderObjectId: any;
    let receiverObjectId: any;
    try {
      senderObjectId = new mongoose.Types.ObjectId(senderId);
      receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    } catch {
      return NextResponse.json(
        { message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    if (senderType === 'user' && req.user?.isSuspended) {
      return NextResponse.json(
        { message: 'Your account is suspended and cannot send messages' },
        { status: 403 }
      );
    }

    const receiverUser = await User.findById(receiverObjectId).select('suspended isActive');
    if (receiverUser && (receiverUser.suspended || !receiverUser.isActive)) {
      return NextResponse.json(
        { message: 'Recipient account is suspended or inactive' },
        { status: 403 }
      );
    }

    const senderModel = senderType === 'admin' ? Admin : User;
    const sender = await senderModel.findById(senderObjectId);

    if (!sender) {
      return NextResponse.json({ message: 'Sender not found' }, { status: 404 });
    }

    let receiver = await User.findById(receiverObjectId);
    let receiverIsAdminFlag = false;
    if (!receiver) {
      receiver = await Admin.findById(receiverObjectId);
      receiverIsAdminFlag = !!receiver;
    }

    if (!receiver) {
      return NextResponse.json({ message: 'Receiver not found' }, { status: 404 });
    }

    const senderName = senderType === 'admin' ? (sender as any).email : (sender as any).username;
    const receiverName = receiverIsAdminFlag ? (receiver as any).email : (receiver as any).username;
    const conversationId = generateConversationId(senderId, receiverId);

    const chat = new Chat({
      senderId: senderObjectId,
      senderModel: senderType === 'admin' ? 'Admin' : 'User',
      senderName,
      receiverId: receiverObjectId,
      receiverModel: receiverIsAdminFlag ? 'Admin' : 'User',
      receiverName,
      message,
      conversationId,
      messageType: 'text',
      fileName: undefined,
      fileType: undefined,
      fileUrl: undefined,
    });

    await chat.save();

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        chat: {
          id: chat._id?.toString?.() || chat._id,
          senderId: chat.senderId?.toString?.() || chat.senderId,
          senderName: chat.senderName,
          message: chat.message,
          messageType: chat.messageType,
          fileUrl: chat.fileUrl,
          fileName: chat.fileName,
          fileSize: chat.fileSize,
          timestamp: chat.createdAt,
          conversationId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, handler);
}
