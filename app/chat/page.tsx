"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ── Desktop components (unchanged) ──────────────────────────────────────────
import TopBar from "@/components/TopBar";
// import LeftNav from "@/components/LeftNav";
import Sidebar from "@/components/SideBar";
import Header from "@/components/Header";
import MainChat from "@/components/MainChat";

// ── Mobile-only components ───────────────────────────────────────────────────
import MobileTopBar from "@/components/Mobiletopbar";
import MobileBottomNav from "@/components/Mobilebottomnav";
import MobileChatList from "@/components/Mobilechatlist";
import MobileStatusList from "@/components/Mobilestatuslist";
import MobileCallsList from "@/components/Mobilecallslist";
import MobileChatView from "@/components/Mobilechatview";

import { Conversation, Message, UserProfile } from "@/types";
import { fetchConversations, fetchConversation, sendMessage, uploadFile, getMemberConversation } from "@/lib/api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";


// ── Shared data ──────────────────────────────────────────────────────────────
// Data will be fetched from backend once authenticated

// ── Root component ────────────────────────────────────────────────────────────
interface ChatPageProps {
  hideTopBar?: boolean;
  adminSelectedUserId?: string;
  adminSelectedUserName?: string;
  adminSelectedConversationId?: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ hideTopBar = false, adminSelectedUserId, adminSelectedUserName, adminSelectedConversationId }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Desktop state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobile state
  const [mobileTab, setMobileTab] = useState<"chats" | "status" | "calls">("chats");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Suspension state
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionChecked, setSuspensionChecked] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // Notification sound
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element and disable browser notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize audio
      if (!notificationAudioRef.current) {
        const audio = new Audio("/f1_radio.mp3");
        audio.volume = 1; // Full volume
        notificationAudioRef.current = audio;
      }
      
      // Disable browser notifications by denying permission
      if ("Notification" in window) {
        Object.defineProperty(window, "Notification", {
          value: undefined,
          writable: false,
          configurable: false,
        });
      }
    }
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    console.log("[ChatPage] 🔊 playNotificationSound called");
    if (notificationAudioRef.current) {
      console.log("[ChatPage] Audio element exists, attempting to play");
      notificationAudioRef.current.currentTime = 0; // Restart from beginning
      notificationAudioRef.current.play().catch((err) => {
        console.error("[ChatPage] ❌ Failed to play notification sound:", err);
      });
    } else {
      console.warn("[ChatPage] ⚠️ Audio element is not initialized");
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId) ?? undefined;

  const { token, user, loading } = useAuth();

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminAuth = localStorage.getItem("admin_auth");
      if (adminAuth) {
        try {
          const data = JSON.parse(adminAuth);
          setAdminToken(data.token);
          setAdminUser({
            id: data.admin._id || data.admin.id,
            username: data.admin.username || data.admin.email,
            email: data.admin.email,
            isAdmin: true,
          });
        } catch {
          setAdminToken(null);
          setAdminUser(null);
        }
      }
      setIsCheckingAdmin(false);
    }
  }, []);

  // Check suspension status for users
  useEffect(() => {
    if (user && !adminUser) {
      setIsSuspended(user.suspended || false);
    } else {
      setIsSuspended(false);
    }
    setSuspensionChecked(true);
  }, [user, adminUser]);

  // Memoize effective token and user to avoid unnecessary re-renders and effect re-runs
  const effectiveToken = React.useMemo(() => token || adminToken, [token, adminToken]);
  const effectiveUser = React.useMemo(
    () => user || adminUser,
    [user, adminUser]
  );

  const handleSend = async (text: string) => {
    if (!activeConv || !effectiveToken || !effectiveUser || isSuspended) return;
    try {
      const resp = await sendMessage(activeConv.otherUserId || "", text, effectiveToken);
      const chat = resp.chat;

      // Add message locally immediately for better UX
      const newMsg: Message = {
        id: chat.id || chat._id,
        sender: chat.senderName || effectiveUser.username,
        content: chat.message,
        time: new Date(chat.timestamp || chat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: true,
        fileUrl: chat.fileUrl,
        fileName: chat.fileName,
        fileType: chat.fileType,
      };
      setMessages((prev) => [...prev, newMsg]);

      const socket = getSocket();
      socket?.emit("new_message", {
        conversationId: chat.conversationId,
        id: chat.id || chat._id,
        senderId: effectiveUser.id,
        senderName: chat.senderName || effectiveUser.username,
        receiverId: activeConv.otherUserId,
        message: chat.message,
        messageType: chat.messageType || "text",
        fileUrl: chat.fileUrl || null,
        fileName: chat.fileName || null,
        fileType: chat.fileType || null,
        timestamp: chat.timestamp || chat.createdAt || new Date().toISOString(),
      });

      // If this was a new conversation (temp ID), just switch to the real conversationId
      // The useEffect room join will handle joining the new room automatically
      if (activeId && activeId.startsWith('temp_')) {
        console.log("[ChatPage] 📍 Switching from temp to real conversation:", chat.conversationId);
        setActiveId(chat.conversationId);
        newUserModeRef.current = null; // Exit new user mode
        
        // Refresh conversations in background
        try {
          const convData = await fetchConversations(effectiveToken);
          const list: Conversation[] = convData.conversations.map((c: any) => ({
            id: c.id || c._id,
            name: c.otherUserName,
            otherUserId: c.otherUserId,
            unread: c.unreadCount,
            lastMessage: c.lastMessage,
            lastMessageTime: c.lastMessageTime,
            online: isIdOnline(c.otherUserId),
          }));
          setConversations(list);

          // Find the newly created conversation and switch to it
          const newConv = list.find((c) => c.otherUserId === activeConv.otherUserId);
          if (newConv) {
            console.log("[ChatPage] Switching from temp to real conversation:", newConv.id);
            newUserModeRef.current = null; // Exit new user mode
            setActiveId(newConv.id);
          }
        } catch (err) {
          console.error("Failed to refresh conversations:", err);
        }
      }
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!activeConv || !effectiveToken || !effectiveUser || isSuspended) return;
    try {
      const resp = await uploadFile(activeConv.otherUserId || "", file, effectiveToken);
      const uploaded = resp.file;
      const socket = getSocket();
      socket?.emit("new_message", {
        conversationId: uploaded?.conversationId,
        id: uploaded?.id || uploaded?._id,
        senderId: effectiveUser.id,
        senderName: uploaded?.senderName || effectiveUser.username,
        receiverId: activeConv.otherUserId,
        message: uploaded?.message || file.name,
        messageType: uploaded?.messageType || "file",
        fileUrl: uploaded?.fileUrl || null,
        fileName: uploaded?.fileName || file.name,
        fileType: uploaded?.fileType || file.type,
        timestamp: uploaded?.timestamp || new Date().toISOString(),
      });
    } catch (err) {
      console.error("File upload failed", err);
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleDesktopSelectConv = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  // Logout handler for regular users (used by Sidebar)
  const handleLogoutUser = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("auth");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.replace("/login");
    }
  };

  const handleMobileSelectConv = (id: string) => {
    setActiveId(id);
    setMobileChatOpen(true);
  };

  const handleSelectUserFromSearch = (userId: string, userName: string) => {
    // Check if conversation already exists with this user
    const existingConv = conversations.find((c) => c.otherUserId === userId);
    if (existingConv) {
      // If exists, just set it as active
      setActiveId(existingConv.id);
    } else {
      // If doesn't exist, create a temporary conversation entry
      const tempConversationId = `temp_${userId}`;
      const newConv: Conversation = {
        id: tempConversationId,
        name: userName,
        otherUserId: userId,
        unread: 0,
        online: isIdOnline(userId),
      };
      // Add to conversations list and set as active
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(tempConversationId);
    }
  };

  // Track if admin just selected a NEW user (no prior conversation)
  const newUserModeRef = React.useRef<string | null>(null); // Will contain userId if new user selected

  // Handle admin selected user - continues existing chats if available
  // This effect ONLY runs when the admin selection changes, not when conversations fetch
  useEffect(() => {
    if (adminSelectedUserId && adminSelectedUserName) {
      console.log("[ChatPage] 🔵 Admin selected user:", { 
        adminSelectedUserId, 
        adminSelectedUserName, 
        hasConversationId: !!adminSelectedConversationId,
        adminSelectedConversationId 
      });
      
      // If a specific conversation ID was provided, use it directly
      if (adminSelectedConversationId) {
        console.log("[ChatPage] ✅ Using provided EXISTING conversation ID:", adminSelectedConversationId);
        newUserModeRef.current = null; // Not a new user
        setActiveId(adminSelectedConversationId);
        return;
      }
      
      // No conversation ID provided = NEW USER (no prior chats)
      console.log("[ChatPage] ✅ NEW USER SELECTED - creating temp conversation");
      const tempConversationId = `temp_${adminSelectedUserId}`;
      newUserModeRef.current = adminSelectedUserId; // Mark as new user mode
      
      const newConv: Conversation = {
        id: tempConversationId,
        name: adminSelectedUserName,
        otherUserId: adminSelectedUserId,
        unread: 0,
        online: false,
      };
      
      // Add temp conversation to the list
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === tempConversationId);
        if (exists) {
          console.log("[ChatPage] Temp conversation already exists in list");
          return prev;
        }
        console.log("[ChatPage] Adding temp conversation to list at top");
        return [newConv, ...prev];
      });
      
      setActiveId(tempConversationId);
      console.log("[ChatPage] ✅ Switched to temp conversation:", tempConversationId);
    }
    // IMPORTANT: Only depend on admin selection props, NOT on conversations or onlineUsers
    // This prevents re-running when data fetches update those arrays
  }, [adminSelectedUserId, adminSelectedUserName, adminSelectedConversationId]);

  const mobileTitles: Record<string, string> = {
    chats: "Chats",
    status: "Status",
    calls: "Calls",
  };

  // Track active conversation ID with ref to avoid listener recreation
  const activeIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
  const playedNotificationMessageIdsRef = React.useRef<Set<string>>(new Set());

  // Helper to check online status robustly (handles different id shapes)
  const isIdOnline = (id: any) => {
    if (!id) return false;
    try {
      const normalized = onlineUsers.map((x) => String(x));
      if (normalized.includes(String(id))) return true;
      if (typeof id === "object") {
        if (id._id && normalized.includes(String(id._id))) return true;
        if (id.id && normalized.includes(String(id.id))) return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Real-time: Setup socket.io connection ONCE when user logs in
  useEffect(() => {
    if (!effectiveToken || !effectiveUser) return;

    // Connect socket and set up listeners
    const socket = connectSocket(
      effectiveToken,
      effectiveUser.id,
      effectiveUser.isAdmin ? "admin" : "user"
    );

    // Fetch initial conversations
    let mounted = true;
    fetchConversations(effectiveToken)
      .then((data) => {
        if (!mounted) return;
        const list: Conversation[] = data.conversations.map((c: any) => ({
          id: c.id,
          name: c.otherUserName,
          otherUserId: c.otherUserId,
          unread: c.unreadCount,
          lastMessage: c.lastMessage,
          lastMessageTime: c.lastMessageTime,
          online: isIdOnline(c.otherUserId),
        }));
        setConversations(list);
        // Only set to first conversation if no active conversation yet AND not in new user mode
        if (list.length > 0 && !activeId && !newUserModeRef.current) {
          console.log("[ChatPage] Setting activeId to first conversation:", list[0].id);
          setActiveId(list[0].id);
        }
      })
      .catch((e) => {
        const errorMsg = e instanceof Error ? e.message : "Failed to fetch conversations";
        setConversationError(errorMsg);
      });

    // Listen for new message events (set up once)
    const handleNewMessage = (data: any) => {
      const incomingMessageId = String(
        data?.id ||
        `${data?.conversationId || "unknown"}-${data?.senderId || "unknown"}-${data?.timestamp || Date.now()}`
      );
      const currentActiveId = activeIdRef.current;
      const isTempActive = !!currentActiveId && currentActiveId.startsWith("temp_");
      const tempTargetUserId = isTempActive ? currentActiveId.slice("temp_".length) : null;
      const isForTempActiveConversation =
        !!tempTargetUserId &&
        (String(data.senderId) === String(tempTargetUserId) ||
          String(data.receiverId) === String(tempTargetUserId));
      const isForOpenConversation =
        data.conversationId === currentActiveId || isForTempActiveConversation;

      console.log("[ChatPage] 📨 Received new_message event:", {
        conversationId: data.conversationId,
        activeConversation: currentActiveId,
        fromUser: data.senderName,
        message: data.message?.substring(0, 50)
      });

      // Play notification for every incoming message from other users/admins, regardless of active chat.
      if (String(data.senderId) !== String(effectiveUser.id)) {
        if (!playedNotificationMessageIdsRef.current.has(incomingMessageId)) {
          playedNotificationMessageIdsRef.current.add(incomingMessageId);
          if (playedNotificationMessageIdsRef.current.size > 500) {
            const firstKey = playedNotificationMessageIdsRef.current.values().next().value;
            if (firstKey) playedNotificationMessageIdsRef.current.delete(firstKey);
          }
          playNotificationSound();
        }
      }

      // If admin/user is on a temp conversation and a real message arrives for that participant,
      // switch to the real conversation id immediately.
      if (isForTempActiveConversation && data.conversationId && data.conversationId !== currentActiveId) {
        setActiveId(data.conversationId);
        newUserModeRef.current = null;
      }

      // If the message is for the active conversation, update messages (prevent duplicates)
      if (isForOpenConversation) {
        console.log("[ChatPage] ✅ Message is for active conversation, adding to list");
        setMessages((prev) => {
          // Check if message already exists by ID (most reliable)
          const existsById = prev.some((msg) => msg.id === data.id);
          if (existsById) {
            console.log("[ChatPage] ⚠️ Message already exists by ID:", data.id);
            return prev;
          }
          
          return [
            ...prev,
            {
              id: data.id,
              sender: data.senderName,
              content: data.message,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isSelf: data.senderId === effectiveUser.id,
              fileUrl: data.fileUrl,
              fileName: data.fileName,
              fileType: data.fileType,
            },
          ];
        });
      }
      // Update conversation list (move to top, update last message, unread, etc.)
      setConversations((prev) => {
        let found = false;
        const updated = prev.map((conv) => {
          // Replace temp conversation id with the real one when first live message arrives.
          if (
            conv.id === currentActiveId &&
            isForTempActiveConversation &&
            data.conversationId
          ) {
            found = true;
            return {
              ...conv,
              id: data.conversationId,
              lastMessage: data.message,
              lastMessageTime: new Date(data.timestamp).toISOString(),
              unread: 0,
            };
          }

          if (conv.id === data.conversationId) {
            found = true;
            return {
              ...conv,
              lastMessage: data.message,
              lastMessageTime: new Date(data.timestamp).toISOString(),
              unread: conv.id === activeIdRef.current ? 0 : (conv.unread || 0) + 1,
            };
          }
          return conv;
        });
        // If not found, refetch conversations
        if (!found) {
          fetchConversations(effectiveToken).then((data) => {
            const list: Conversation[] = data.conversations.map((c: any) => ({
              id: c.id,
              name: c.otherUserName,
              otherUserId: c.otherUserId,
              unread: c.unreadCount,
              lastMessage: c.lastMessage,
              lastMessageTime: c.lastMessageTime,
              online: isIdOnline(c.otherUserId),
            }));
            setConversations(list);
          });
        }
        return updated;
      });
    };

    socket.off("new_message"); // Remove old listener if any
    console.log("[ChatPage] 🎧 Setting up new_message listener");
    socket.on("new_message", handleNewMessage);
    console.log("[ChatPage] ✅ new_message listener registered");

    // Re-attach listener on reconnection
    const handleReconnect = () => {
      console.log("[ChatPage] 🔄 Socket reconnected, re-attaching message listener");
      socket.off("new_message");
      socket.on("new_message", handleNewMessage);
    };
    socket.on("reconnect", handleReconnect);

    return () => {
      console.log("[ChatPage] 🎧 Removing new_message listener");
      socket.off("new_message", handleNewMessage);
      socket.off("reconnect", handleReconnect);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToken, effectiveUser]);

  // Fetch messages for active conversation (only once when conversation changes)
  useEffect(() => {
    if (!effectiveToken || !activeId || !effectiveUser) return;
      if (activeId.startsWith('temp_')) {
        // For admins with temp conversations, try to fetch existing chats between admin and selected user
        if (effectiveUser.isAdmin) {
          const selectedUserId = activeId.slice('temp_'.length);
          if (selectedUserId) {
            getMemberConversation(effectiveUser.id, selectedUserId, effectiveToken)
              .then((data) => {
                const msgs: Message[] = (data.messages || []).map((m: any) => {
                  let displayFileType: 'image' | 'file' | undefined;
                  if (m.messageType === 'file' && m.fileType) {
                    displayFileType = m.fileType.startsWith('image/') ? 'image' : 'file';
                  }
                  return {
                    id: m.id || m._id,
                    sender: m.senderName,
                    content: m.content || m.message,
                    time: new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isSelf: m.senderId === effectiveUser.id,
                    fileUrl: m.fileUrl,
                    fileName: m.fileName,
                    fileType: displayFileType,
                  };
                });
                setMessages(msgs);
              })
              .catch(() => {
                // No chats yet between admin and user
                setMessages([]);
              });
            return;
          }
        }
        // For regular users, temp conversations are empty until messages are sent
        setMessages([]);
        return;
      }

      // Admins should fetch member conversations via admin endpoints (they may not be direct participants)
      if (effectiveUser.isAdmin && activeId.includes('-')) {
        // conversationId format is user1-user2
        const parts = String(activeId).split('-');
        if (parts.length === 2) {
          getMemberConversation(parts[0], parts[1], effectiveToken)
            .then((data) => {
              const msgs: Message[] = (data.messages || []).map((m: any) => {
                let displayFileType: 'image' | 'file' | undefined;
                if (m.messageType === 'file' && m.fileType) {
                  displayFileType = m.fileType.startsWith('image/') ? 'image' : 'file';
                }
                return {
                  id: m.id || m._id,
                  sender: m.senderName,
                  content: m.content || m.message,
                  time: new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  isSelf: m.senderId === effectiveUser.id,
                  fileUrl: m.fileUrl,
                  fileName: m.fileName,
                  fileType: displayFileType,
                };
              });
              setMessages(msgs);
              setConversations((prev) =>
                prev.map((conv) => (conv.id === activeId ? { ...conv, unread: 0 } : conv))
              );
            })
            .catch((e) => {
              console.error(e);
            });
          return;
        }
      }

      fetchConversation(activeId, effectiveToken)
        .then((data) => {
          const msgs: Message[] = data.messages.map((m: any) => {
          let displayFileType: 'image' | 'file' | undefined;
          if (m.messageType === 'file' && m.fileType) {
            displayFileType = m.fileType.startsWith('image/') ? 'image' : 'file';
          }
          return {
            id: m._id,
            sender: m.senderName,
            content: m.message,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSelf: m.senderId === effectiveUser.id,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            fileType: displayFileType,
          };
        });
        setMessages(msgs);
        setConversations((prev) =>
          prev.map((conv) => (conv.id === activeId ? { ...conv, unread: 0 } : conv))
        );
      })
      .catch((e) => {
        console.error(e);
      });
  }, [activeId, effectiveToken, effectiveUser]);

  // SIMPLE: Join/leave socket rooms when active conversation changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeId) {
      return;
    }

    console.log("[ChatPage] 📡 Joining room:", activeId);
    socket.emit("join", activeId);

    return () => {
      console.log("[ChatPage] 📤 Leaving room:", activeId);
      socket.emit("leave", activeId);
    };
  }, [activeId]);

  // Update conversations with online status
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        online: isIdOnline(conv.otherUserId),
      }))
    );
  }, [onlineUsers]);

  // redirect to login if not authenticated (both user and admin)
  const router = useRouter();
  useEffect(() => {
    if (!token && !adminToken && !loading && !isCheckingAdmin) {
      router.replace("/login");
    }
  }, [token, adminToken, loading, isCheckingAdmin, router]);

  // Redirect suspended users to login
  useEffect(() => {
    if (isSuspended && suspensionChecked && !adminUser) {
      // Clear auth and redirect
      localStorage.removeItem("auth");
      router.replace("/login");
    }
  }, [isSuspended, suspensionChecked, adminUser, router]);

  return (
    <>
      {/* Suspension Warning */}
      {isSuspended && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1d2133] border border-[#ef4444]/30 rounded-2xl p-8 max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-[#ef4444]">Account Suspended</h3>
            </div>
            <p className="text-[14px] text-[#8891aa] mb-6">
              Your account has been suspended and you cannot send or receive messages. Please contact support for more information.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("auth");
                router.replace("/login");
              }}
              className="w-full px-4 py-2.5 bg-[#ef4444] text-white rounded-lg font-semibold text-[14px] hover:bg-[#dc2626] transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {/* Error Banner - Conversation Loading Error */}
      {conversationError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-4 py-3 text-[14px] text-[#ef4444] flex items-center gap-2 max-w-md shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="flex-1">{conversationError}</span>
          <button
            onClick={() => setConversationError(null)}
            className="text-[#ef4444] hover:text-[#ef4444]/80 ml-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT — visible only on md and above (≥ 768px)
          Identical to the original — no class changed
      ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-screen bg-[#161929] font-sans overflow-hidden">
        {!hideTopBar && <TopBar token={effectiveToken} onUserSelect={handleSelectUserFromSearch} />}
        <div className="flex flex-1 overflow-hidden relative">
          {/* <LeftNav /> */}
          <div className="flex">
            <Sidebar
              conversations={conversations}
              activeId={activeId || ""}
              onSelect={handleDesktopSelectConv}
              isAdmin={!!(effectiveUser && effectiveUser.isAdmin)}
              onLogout={handleLogoutUser}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header
              conversation={activeConv}
              onMenuClick={() => setSidebarOpen((v) => !v)}
            />
            <MainChat
              messages={messages}
              recipientName={activeConv?.name ?? ""}
              onSend={handleSend}
              onFileUpload={handleFileUpload}
              isSuspended={isSuspended}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE / TABLET LAYOUT — visible only below md (< 768px)
          WhatsApp-style: bottom tab nav + full-screen lists + slide-in chat
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex md:hidden flex-col h-screen bg-[#111827] font-sans overflow-hidden">

        {/* Full-screen chat view — replaces everything when a chat is open */}
        {mobileChatOpen && activeConv ? (
          <MobileChatView
            conversation={activeConv}
            messages={messages}
            onBack={() => setMobileChatOpen(false)}
            onSend={handleSend}
            isSuspended={isSuspended}
          />
        ) : (
          <>
            {/* Top bar */}
            <MobileTopBar title={mobileTitles[mobileTab]} />

            {/* Tab content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {mobileTab === "chats" && (
                <MobileChatList
                  conversations={conversations}
                  activeId={activeId || ""}
                  onSelect={handleMobileSelectConv}
                  isAdmin={!!adminUser}
                />
              )}
              {mobileTab === "status" && <MobileStatusList />}
              {mobileTab === "calls" && <MobileCallsList />}

              {/* FAB */}
              <button className="absolute bottom-4 right-4 w-14 h-14 bg-[#4e6ef2] rounded-full flex items-center justify-center shadow-xl shadow-[#4e6ef2]/40 active:scale-95 transition-transform z-10">
                {mobileTab === "chats" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                {mobileTab === "status" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                )}
                {mobileTab === "calls" && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 2.97 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Bottom tab navigation */}
            <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
          </>
        )}
      </div>
    </>
  );
};

export default ChatPage;

