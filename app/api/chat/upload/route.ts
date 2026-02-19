import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';
import User from '../../models/User';
import Admin from '../../models/Admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import mongoose from 'mongoose';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;
    const userType = req.user?.type;

    if (userType === 'user' && req.user?.isSuspended) {
      return NextResponse.json(
        { message: 'Your account is suspended' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const receiverId = formData.get('receiverId') as string;
    const message = formData.get('message') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        { message: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    let userObjectId: any;
    let receiverObjectId: any;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
      receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    } catch {
      return NextResponse.json(
        { message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const senderModel = userType === 'admin' ? Admin : User;
    const sender = await senderModel.findById(userObjectId);
    if (!sender) {
      return NextResponse.json({ message: 'Sender not found' }, { status: 404 });
    }

    let receiver = await User.findById(receiverId);
    let receiverIsAdminFlag = false;
    if (!receiver) {
      receiver = await Admin.findById(receiverId);
      receiverIsAdminFlag = !!receiver;
    }
    if (!receiver) {
      return NextResponse.json({ message: 'Receiver not found' }, { status: 404 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${ext}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const conversationId = [
      userId!.toString(),
      receiverId.toString(),
    ]
      .sort()
      .join('-');

    const senderName = userType === 'admin' ? (sender as any).email : (sender as any).username;
    const receiverName = receiverIsAdminFlag ? (receiver as any).email : (receiver as any).username;

    const newMessage = new Chat({
      conversationId,
      senderId: userObjectId,
      senderModel: userType === 'admin' ? 'Admin' : 'User',
      senderName,
      receiverId: receiverObjectId,
      receiverModel: receiverIsAdminFlag ? 'Admin' : 'User',
      receiverName,
      message: message || file.name,
      messageType: 'file',
      fileType: file.type,
      fileName: file.name,
      fileUrl: `/uploads/${fileName}`,
      isRead: false,
      createdAt: new Date(),
    });

    await newMessage.save();

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        file: {
          id: newMessage._id?.toString?.() || newMessage._id,
          senderId: newMessage.senderId?.toString?.() || newMessage.senderId,
          senderName: newMessage.senderName,
          message: newMessage.message,
          messageType: newMessage.messageType,
          fileUrl: `/uploads/${fileName}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          timestamp: newMessage.createdAt,
          conversationId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, handler);
}
