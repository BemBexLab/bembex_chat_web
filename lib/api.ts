const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export async function logout(token: string) {
  const res = await fetch(`${BASE_URL}/user/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username?: string;
    email?: string;
    type?: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

export async function fetchProfile(token: string) {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch profile");
  }
  return res.json();
}

export async function searchUsers(query: string, token: string) {
  const res = await fetch(`${BASE_URL}/user/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to search users");
  }
  return res.json();
}

export async function fetchConversations(token: string) {
  const res = await fetch(`${BASE_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch conversations");
  }
  return res.json();
}

export async function fetchConversation(conversationId: string, token: string, page = 1, limit = 50) {
  const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch conversation");
  }
  return res.json();
}

export async function sendMessage(receiverId: string, message: string, token: string) {
  const res = await fetch(`${BASE_URL}/chat/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiverId, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send message");
  }
  return res.json();
}

export async function uploadFile(receiverId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append("receiverId", receiverId);
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/chat/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload file");
  }
  return res.json();
}

export async function getAllUsers(token: string) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch users");
  }
  return res.json();
}

export async function updateProfile(token: string, data: any) {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update profile");
  }
  return res.json();
}

export async function changePassword(token: string, oldPassword: string, newPassword: string) {
  const res = await fetch(`${BASE_URL}/user/password`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to change password");
  }
  return res.json();
}

// Admin functions
export async function getAdminUsers(token: string) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch users");
  }
  return res.json();
}

export async function createUser(token: string, userData: { username: string; email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create user");
  }
  return res.json();
}

export async function updateUser(token: string, userId: string, userData: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(token: string, userId: string) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete user");
  }
  return res.json();
}

export async function suspendUser(token: string, userId: string, action: 'suspend' | 'unsuspend' | 'activate' | 'deactivate') {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to ${action} user`);
  }
  return res.json();
}

export async function getUser(token: string, userId: string) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch user");
  }
  return res.json();
}

export async function getMemberConversation(userId1: string, userId2: string, token: string) {
  const url = `${BASE_URL}/admin/chats?user1=${userId1}&user2=${userId2}`;
  console.log("Fetching from URL:", url);
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  
  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch conversation (${res.status})`);
  }
  
  const data = await res.json();
  console.log("Raw data from backend:", data);
  
  // Normalize to { messages: ConversationMessage[] }
  return {
    messages: (data.chats || []).map((msg: any) => ({
      id: msg._id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      receiverId: msg.receiverId,
      receiverName: msg.receiverName,
      content: msg.message,  // Chat model uses 'message' field, map to 'content'
      timestamp: msg.createdAt,
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileType: msg.fileType || null,
      messageType: msg.messageType || null,
    })),
  };
}

export async function resetUserPassword(token: string, userId: string, newPassword: string) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to reset password");
  }
  return res.json();
}

export async function getDashboardStats(token: string) {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch stats");
  }
  return res.json();
}

export async function getAdminConversations(token: string, page = 1, limit = 50) {
  const res = await fetch(`${BASE_URL}/admin/conversations?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch conversations");
  }
  return res.json();
}

// Chat endpoints
export async function getAllUsersForChat(token: string, page = 1, limit = 50) {
  const res = await fetch(`${BASE_URL}/chat/users?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch users");
  }
  return res.json();
}

export async function getAdminForChat(token: string) {
  const res = await fetch(`${BASE_URL}/chat/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch admin");
  }
  return res.json();
}

export async function deleteMessage(messageId: string, token: string) {
  const res = await fetch(`${BASE_URL}/chat/messages/${messageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete message");
  }
  return res.json();
}

export async function getUnreadCount(token: string) {
  const res = await fetch(`${BASE_URL}/chat/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch unread count");
  }
  return res.json();
}

export async function markAsRead(conversationId: string, token: string) {
  const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/mark-read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to mark messages as read");
  }
  return res.json();
}

// Admin Authentication
export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Admin login failed");
  }
  return res.json();
}

export async function adminLogout(token: string) {
  const res = await fetch(`${BASE_URL}/admin/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Admin logout failed");
  return res.json();
}
