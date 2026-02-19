"use client";
import React, { useState } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  createdAt: string;
}

const AdminMonitorChats: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user1, setUser1] = useState<string>("");
  const [user2, setUser2] = useState<string>("");
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users for dropdowns
  React.useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  const fetchChats = async () => {
    if (!user1 || !user2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chats?user1=${user1}&user2=${user2}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (err: any) {
      setError(err.message);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Monitor Chats Between Users</h2>
      <div className="flex gap-4 mb-4">
        <select value={user1} onChange={e => setUser1(e.target.value)} className="p-2 border rounded">
          <option value="">Select User 1</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
        </select>
        <select value={user2} onChange={e => setUser2(e.target.value)} className="p-2 border rounded">
          <option value="">Select User 2</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
        </select>
        <button onClick={fetchChats} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!user1 || !user2 || loading}>View Chat</button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
        {loading ? <div>Loading...</div> :
          chats.length === 0 ? <div>No messages found.</div> :
            chats.map(msg => (
              <div key={msg._id} className="mb-2">
                <span className="font-semibold">{msg.senderName}</span>: {msg.message}
                <span className="text-xs text-gray-500 ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            ))}
      </div>
    </div>
  );
};

export default AdminMonitorChats;
