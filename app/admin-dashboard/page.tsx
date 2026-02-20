"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "@/components/Adminsidebar";
import AdminTopBar from "@/components/Admintopbar";
import DashboardOverview from "@/components/Dasboardoverview";
import UsersManagement from "@/components/Usersmanagement";
import ConversationMonitor from "@/components/Conversationmonitor";
import { connectSocket, getSocket } from "@/lib/socket";

import dynamic from "next/dynamic";

type AdminView = "dashboard" | "users" | "monitor" | "chat";

const ChatPage = dynamic(() => import("../chat/page"), { ssr: false });

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const playedNotificationMessageIdsRef = useRef<Set<string>>(new Set());
  const router = typeof window !== "undefined" ? require("next/navigation").useRouter() : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if regular user is trying to access admin dashboard
      const userAuth = localStorage.getItem("auth");
      if (userAuth) {
        // Regular user found, redirect to chat
        window.location.href = "/chat";
        return;
      }

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
      } else {
        setAdminToken(null);
        setAdminUser(null);
      }
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!isChecking && typeof window !== "undefined" && !adminToken) {
      window.location.href = "/admin-login";
    }
  }, [adminToken, isChecking]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateLayout = () => setIsDesktop(mediaQuery.matches);
    updateLayout();

    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!notificationAudioRef.current) {
      const audio = new Audio("/f1_radio.mp3");
      audio.volume = 1;
      notificationAudioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    // Chat page already handles message sounds; only keep this listener for non-chat views.
    if (!adminToken || !adminUser || activeView === "chat") return;

    const socket = connectSocket(adminToken, adminUser.id, "admin");

    const handleNewMessage = (data: any) => {
      if (String(data?.senderId) === String(adminUser.id)) return;

      const incomingMessageId = String(
        data?.id ||
          `${data?.conversationId || "unknown"}-${data?.senderId || "unknown"}-${data?.timestamp || Date.now()}`
      );

      if (playedNotificationMessageIdsRef.current.has(incomingMessageId)) return;
      playedNotificationMessageIdsRef.current.add(incomingMessageId);
      if (playedNotificationMessageIdsRef.current.size > 500) {
        const firstKey = playedNotificationMessageIdsRef.current.values().next().value;
        if (firstKey) playedNotificationMessageIdsRef.current.delete(firstKey);
      }

      if (notificationAudioRef.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch(() => {});
      }
    };

    socket.off("new_message", handleNewMessage);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [adminToken, adminUser, activeView]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Clear localStorage for both admin and user
      localStorage.removeItem("admin_auth");
      localStorage.removeItem("auth");
      // Clear cookies for both admin and user tokens (try all path/domain combos)
      // Try to clear admin_token cookie for all possible domain/path combos
      const domains = [window.location.hostname, window.location.hostname.replace(/^www\./, ""), "", window.location.host];
      const paths = ["/", ""];
      for (const domain of domains) {
        for (const path of paths) {
          let cookie = `admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
          if (path) cookie += ` path=${path};`;
          if (domain) cookie += ` domain=${domain};`;
          document.cookie = cookie;
        }
      }
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "authToken=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/admin-login/";
    }
  };

  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    setSidebarOpen(false); // Close sidebar when view changes on mobile
  };

  if (isChecking || !adminToken) {
    return null;
  }

  return (
    <>
      {/* DESKTOP: flex layout */}
      {isDesktop && (
      <div className="h-screen bg-[#161929] font-sans overflow-hidden flex">
        {/* Sidebar */}
        <AdminSidebar activeView={activeView} onViewChange={handleViewChange} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <AdminTopBar
            onLogout={handleLogout}
            token={adminToken}
            onUserSelect={(userId, userName, conversationId) => {
              console.log("[AdminDashboard] User selected from topbar search:", {
                userId,
                userName,
                conversationId,
              });
              setSelectedUserId(userId);
              setSelectedUserName(userName);
              setSelectedConversationId(conversationId || null);
              handleViewChange("chat");
            }}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeView === "dashboard" && (
              <DashboardOverview
                onViewChatsClick={() => handleViewChange("chat")}
                onManageUsersClick={() => handleViewChange("users")}
              />
            )}
            {activeView === "users" && <UsersManagement />}
            {activeView === "monitor" && <ConversationMonitor />}
            {activeView === "chat" && (
              <ChatPage
                hideTopBar={true}
                adminSelectedUserId={selectedUserId || undefined}
                adminSelectedUserName={selectedUserName || undefined}
                adminSelectedConversationId={selectedConversationId || undefined}
              />
            )}
          </div>
        </div>
      </div>
      )}

      {/* MOBILE/TABLET: vertical stack with hamburger menu */}
      {!isDesktop && (
      <div className="flex flex-col h-screen bg-[#161929] font-sans overflow-hidden">
        {/* Top Bar with Hamburger */}
        <div className="h-16 bg-[#1d2133] border-b border-[#2a2e3e] flex items-center justify-between px-4 flex-shrink-0">
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center text-[#8891aa] hover:text-[#ccd4f5] transition-colors lg:hidden"
            title="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <span className="text-[14px] font-bold text-[#ccd4f5] flex-1 text-center">
            {({ dashboard: "Dashboard", users: "Users", monitor: "Conversations", chat: "Chat" } as Record<AdminView, string>)[activeView]}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-colors"
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Admin TopBar for user search */}
        <AdminTopBar
          onLogout={handleLogout}
          token={adminToken}
          onUserSelect={(userId, userName, conversationId) => {
            setSelectedUserId(userId);
            setSelectedUserName(userName);
            setSelectedConversationId(conversationId || null);
            handleViewChange("chat");
            setSidebarOpen(false);
          }}
        />

        {/* Overlay for sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar (slide-out on mobile) */}
        <div
          className={`fixed left-0 top-16 bottom-0 w-64 bg-[#1d2133] border-r border-[#2a2e3e] z-50 overflow-y-auto transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar activeView={activeView} onViewChange={handleViewChange} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && (
            <div className="p-4">
              <DashboardOverview
                onViewChatsClick={() => handleViewChange("chat")}
                onManageUsersClick={() => handleViewChange("users")}
              />
            </div>
          )}
          {activeView === "users" && (
            <div className="p-4">
              <UsersManagement />
            </div>
          )}
          {activeView === "monitor" && (
            <div className="p-4">
              <ConversationMonitor />
            </div>
          )}
          {activeView === "chat" && (
            <ChatPage
              hideTopBar={false}
              adminSelectedUserId={selectedUserId || undefined}
              adminSelectedUserName={selectedUserName || undefined}
              adminSelectedConversationId={selectedConversationId || undefined}
            />
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default AdminDashboard;
