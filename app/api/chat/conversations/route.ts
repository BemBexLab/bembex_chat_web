import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';
import User from '../../models/User';
import mongoose from 'mongoose';

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const userId = req.user?.id;
    const userType = req.user?.type;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID not found in token' },
        { status: 401 }
      );
    }

    if (userType === 'user' && req.user?.isSuspended) {
      return NextResponse.json(
        { message: 'Your account is suspended' },
        { status: 403 }
      );
    }

    // Convert userId to ObjectId for aggregation
    let userObjectId: any;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const pipeline = [
      {
        $match: {
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          senderId: { $first: '$senderId' },
          receiverId: { $first: '$receiverId' },
          senderName: { $first: '$senderName' },
          receiverName: { $first: '$receiverName' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userObjectId] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ['$senderId', userObjectId] },
              '$receiverId',
              '$senderId',
            ],
          },
          otherUserName: {
            $cond: [
              { $eq: ['$senderId', userObjectId] },
              '$receiverName',
              '$senderName',
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          otherUserId: 1,
          otherUserName: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          unread: 1,
        },
      },
      {
        $addFields: {
          otherUserId: { $toString: '$otherUserId' },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ];

    const conversations = await Chat.aggregate(pipeline as any);

    const formattedConversations = conversations.map((conv: any) => ({
      id: conv._id,
      otherUserId: conv.otherUserId,
      otherUserName: conv.otherUserName,
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unread,
    }));

    return NextResponse.json(
      {
        message: 'Conversations retrieved successfully',
        conversations: formattedConversations,
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
