export interface AdminUser {
  id: string;
  username: string;
  email: string;
  status: "active" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  // Optional file attachments
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  messageType?: 'text' | 'file' | 'voice' | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalConversations: number;
}