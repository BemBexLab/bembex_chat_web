import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';
import { connectDB } from '../../utils/database';
import Chat from '../../models/Chat';
import mongoose from 'mongoose';

const getFullFileUrl = (relativeUrl: string, req: NextRequest) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const protocol = req.nextUrl.protocol.replace(':', '');
  const host = req.nextUrl.host;
  return `${protocol}://${host}${relativeUrl}`;
};

async function handler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const adminId = req.user?.id;
    const userType = req.user?.type;

    if (userType !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!adminId) {
      return NextResponse.json(
        { message: 'Admin ID not found in token' },
        { status: 401 }
      );
    }

    // Convert adminId to ObjectId for aggregation
    let adminObjectId: any;
    try {
      adminObjectId = new mongoose.Types.ObjectId(adminId);
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid admin ID format' },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    // Aggregation pipeline to get conversations involving the admin
    const pipeline = [
      // Match chats where admin is either sender or receiver
      {
        $match: {
          $or: [
            { senderId: adminObjectId },
            { receiverId: adminObjectId },
          ],
        },
      },
      // Sort by creation date descending
      {
        $sort: { createdAt: -1 },
      },
      // Group by conversationId
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 },
          lastMessageTime: { $first: '$createdAt' },
          senderId: { $first: '$senderId' },
          receiverId: { $first: '$receiverId' },
          senderName: { $first: '$senderName' },
          receiverName: { $first: '$receiverName' },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', adminObjectId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // Add fields to identify the other user
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ['$senderId', adminObjectId] },
              '$receiverId',
              '$senderId',
            ],
          },
          otherUserName: {
            $cond: [
              { $eq: ['$senderId', adminObjectId] },
              '$receiverName',
              '$senderName',
            ],
          },
        },
      },
      // Project the fields we need
      {
        $project: {
          _id: 1,
          id: '$_id',
          otherUserId: { $toString: '$otherUserId' },
          otherUserName: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          messageCount: 1,
          unreadCount: '$unread',
        },
      },
      // Sort by last message time
      {
        $sort: { lastMessageTime: -1 },
      },
      // Skip and limit for pagination
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const conversations = await Chat.aggregate(pipeline as any);

    // Get total count
    const totalPipeline = [
      {
        $match: {
          $or: [
            { senderId: adminObjectId },
            { receiverId: adminObjectId },
          ],
        },
      },
      {
        $group: {
          _id: '$conversationId',
        },
      },
    ];

    const totalResults = await Chat.aggregate(totalPipeline as any);
    const total = totalResults.length;

    // Add full file URLs to last message
    const conversationsWithUrls = conversations.map((conv) => ({
      ...conv,
      lastMessage: {
        ...conv.lastMessage,
        fileUrl: (conv.lastMessage as any).fileUrl
          ? getFullFileUrl((conv.lastMessage as any).fileUrl, req)
          : null,
      },
    }));

    return NextResponse.json(
      {
        message: 'Conversations retrieved successfully',
        conversations: conversationsWithUrls,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Admin Conversations] Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, handler);
}
