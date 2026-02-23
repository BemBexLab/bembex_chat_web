"use client";

import React, { useState, useEffect } from "react";
import { ConversationMessage } from "@/types/admin";
import { getAdminUsers, getMemberConversation } from "@/lib/api";

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  status?: string;
}

const ConversationMonitor: React.FC = () => {
  const [user1, setUser1] = useState<string>("");
  const [user2, setUser2] = useState<string>("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Get admin token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin_auth");
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.token;
      }
    }
    return null;
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          setError("No authentication token found");
          return;
        }
        const response = await getAdminUsers(token);
        setUsers(response.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Generate conversation key (always sort IDs to maintain consistency)
  const getConversationKey = (id1: string, id2: string) => {
    return [id1, id2].sort().join("-");
  };

  const user1Name = users.find(u => u.id === user1)?.username || "";
  const user2Name = users.find(u => u.id === user2)?.username || "";

  const handleLoadConversation = async () => {
    if (!user1 || !user2) {
      alert("Please select both users");
      return;
    }
    if (user1 === user2) {
      alert("Please select two different users");
      return;
    }

    setConversationLoading(true);
    setConversationError(null);
    setMessages([]);

    try {
      const token = getToken();
      if (!token) {
        setConversationError("No authentication token found");
        return;
      }
      const response = await getMemberConversation(user1, user2, token);
      console.log("[ConversationMonitor] Messages loaded successfully");
      // Keep chronological order: oldest at top, newest at bottom.
      setMessages(response.messages || []);
      if (!response.messages || response.messages.length === 0) {
        setConversationError("No messages found between these users");
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setConversationError(err instanceof Error ? err.message : "Failed to fetch conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-black text-[#e4e9f7] mb-1">Monitor Conversations</h1>
        <p className="text-[13px] text-[#8891aa]">Select two users to view their conversation history</p>
      </div>

      {/* User Selection */}
      <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-xl p-6">
        <h2 className="text-[16px] font-bold text-[#e4e9f7] mb-4">Select Users</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User 1 */}
          <div>
            <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
              User 1
            </label>
            <select
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              disabled={loading}
              className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] focus:border-[#4e6ef2] focus:outline-none transition-colors disabled:opacity-50"
            >
              <option value="">{loading ? "Loading..." : "Select user..."}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} disabled={user.id === user2}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* User 2 */}
          <div>
            <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
              User 2
            </label>
            <select
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              disabled={loading}
              className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] focus:border-[#4e6ef2] focus:outline-none transition-colors disabled:opacity-50"
            >
              <option value="">{loading ? "Loading..." : "Select user..."}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} disabled={user.id === user1}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Load Button */}
          <div className="flex items-end">
            <button
              onClick={handleLoadConversation}
              disabled={!user1 || !user2 || user1 === user2 || conversationLoading}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#4e6ef2] to-[#3d5de0] text-white rounded-lg hover:shadow-lg hover:shadow-[#4e6ef2]/30 font-semibold text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conversationLoading ? "Loading..." : "Load Conversation"}
            </button>
          </div>
        </div>

        {/* Selected users display */}
        {user1 && user2 && user1 !== user2 && (
          <div className="mt-4 p-3 bg-[#252b40] border border-[#4e6ef2]/20 rounded-lg flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4e6ef2" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-[13px] text-[#8891aa]">
              Viewing conversation: <span className="text-[#4e6ef2] font-semibold">{user1Name}</span> ⟷ <span className="text-[#4e6ef2] font-semibold">{user2Name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Messages View */}
      <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-400px)]">
        {user1 && user2 && user1 !== user2 ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2a2e3e] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-[16px] font-bold text-[#e4e9f7]">
                  {user1Name} ⟷ {user2Name}
                </h3>
                <p className="text-[12px] text-[#555e7a]">{messages.length} messages</p>
              </div>
              <div className="flex items-center gap-2">
                {/* {messages.length > 0 && (
                  <button 
                    onClick={() => {
                      // Redirect to chat page with selected users
                      window.location.href = `/chat?user1=${user1}&user2=${user2}`;
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4e6ef2]/10 text-[#4e6ef2] rounded-lg hover:bg-[#4e6ef2]/20 text-[12px] font-semibold transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    View Chats
                  </button>
                )} */}
                <button
                  onClick={() => {
                    setUser1("");
                    setUser2("");
                    setMessages([]);
                    setConversationError(null);
                  }}
                  className="px-3 py-1.5 bg-[#252b40] text-[#8891aa] rounded-lg hover:bg-[#2a3152] text-[12px] font-semibold transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Error display */}
            {conversationError && (
              <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-[13px] text-red-400">{conversationError}</span>
              </div>
            )}

            {/* Messages */}
            {conversationLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#252b40] flex items-center justify-center animate-spin">
                    <div className="w-8 h-8 border-2 border-[#4e6ef2]/30 border-t-[#4e6ef2] rounded-full" />
                  </div>
                  <p className="text-[14px] text-[#8891aa]">Loading messages...</p>
                </div>
              </div>
            ) : messages.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                <div className="text-center mb-6 pt-2">
                  <p className="text-[12px] text-[#555e7a]">Scroll up to see older messages</p>
                </div>
                {messages.map((msg) => {
                  const fileUrl = msg.fileUrl
                    ? msg.fileUrl.startsWith("http")
                      ? msg.fileUrl
                      : typeof window !== "undefined"
                      ? window.location.origin + msg.fileUrl
                      : msg.fileUrl
                    : null;
                  const normalizedType = (msg.fileType || "").toLowerCase();
                  const lowerFileName = (msg.fileName || "").toLowerCase();
                  const isImageAttachment =
                    !!fileUrl &&
                    (msg.messageType === "file" &&
                      (normalizedType.startsWith("image/") ||
                        normalizedType === "image" ||
                        /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/.test(lowerFileName)));

                  return (
                    <div key={msg.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-[#4e6ef2]">
                          {msg.senderName}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555e7a" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className="text-[12px] font-semibold text-[#3ecf8e]">
                          {msg.receiverName}
                        </span>
                        <span className="text-[11px] text-[#555e7a] ml-auto">{msg.timestamp}</span>
                      </div>

                      <div className="bg-[#252b40] border border-[#2a2e3e] rounded-lg px-4 py-2.5 max-w-[80%]">
                        {fileUrl ? (
                          <div className="flex flex-col gap-2">
                            {isImageAttachment ? (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img src={fileUrl} alt={msg.fileName || "image"} className="max-w-full rounded-md shadow-sm" />
                              </a>
                            ) : (
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-[13px] text-[#ccd4f5] truncate">{msg.fileName || "Download file"}</div>
                                <a
                                  href={fileUrl}
                                  download={msg.fileName || true}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4e6ef2] font-semibold text-[13px]"
                                >
                                  Download
                                </a>
                              </div>
                            )}

                            {msg.content && (
                              <p className="text-[13px] text-[#ccd4f5] leading-relaxed">{msg.content}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[13px] text-[#ccd4f5] leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#252b40] flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555e7a" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="8" y1="10" x2="16" y2="10" />
                      <line x1="8" y1="14" x2="14" y2="14" />
                    </svg>
                  </div>
                  <p className="text-[14px] text-[#8891aa] mb-1">No messages found</p>
                  <p className="text-[12px] text-[#555e7a]">These users haven't chatted yet</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#252b40] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555e7a" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-[14px] text-[#8891aa] mb-1">Select two users above</p>
              <p className="text-[12px] text-[#555e7a]">Choose users from the dropdowns to view their conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationMonitor;
