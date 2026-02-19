export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isSelf: boolean;
  isNew?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'file';
}

export interface UserProfile {
  suspended: boolean;
  id: string;
  username: string;
  email: string;
}

export interface Conversation {
  id: string;
  name: string;
  otherUserId?: string;
  online?: boolean;
  isGroup?: boolean;
  unread?: number;             // unread count
  lastMessage?: string;
  lastMessageTime?: string;

}