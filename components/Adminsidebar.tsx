"use client";

import React, { useEffect, useState } from "react";

type AdminView = "dashboard" | "users" | "monitor" | "chat";

interface AdminSidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onViewChange }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("admin_auth") : null;
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const token = parsed?.token;
        if (!token) return;

        const res = await fetch("/api/chat/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setUnreadCount(Number(data?.unreadCount || 0));
        }
      } catch {
        // ignore polling errors in sidebar
      }
    };

    fetchUnread();
    const intervalId = setInterval(fetchUnread, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const menuItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "User Management",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    // {
    //   id: "monitor",
    //   label: "Monitor Chats",
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    //       <line x1="9" y1="10" x2="15" y2="10" />
    //       <line x1="9" y1="14" x2="12" y2="14" />
    //     </svg>
    //   ),
    // },  Monitor Chats view is currently not implemented, so it's commented out to avoid confusion. It can be re-enabled once the feature is ready.
    {
      id: "chat",
      label: "Chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="9" y1="14" x2="12" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-64 min-w-[256px] bg-[#1a1f2e] border-r border-[#2a2e3e] h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b border-[#2a2e3e] flex items-center px-5 gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-[#4e6ef2] to-[#3ecf8e] rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-base">B</span>
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-[#e4e9f7]">Admin Panel</h1>
          <p className="text-[11px] text-[#555e7a]">Management Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                activeView === item.id
                  ? "bg-gradient-to-r from-[#4e6ef2]/20 to-transparent border-l-2 border-[#4e6ef2] text-[#4e6ef2]"
                  : "text-[#8891aa] hover:bg-[#252b40] hover:text-[#ccd4f5]"
              }`}
            >
              <div className={activeView === item.id ? "text-[#4e6ef2]" : "text-[#555e7a]"}>
                {item.icon}
              </div>
              <span className="text-[14px] font-medium">{item.label}</span>
              {item.id === "chat" && unreadCount > 0 && (
                <span
                  className="ml-auto w-2.5 h-2.5 rounded-full bg-[#4e6ef2] shadow-[0_0_8px_rgba(78,110,242,0.8)]"
                  title={`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer info */}
      <div className="border-t border-[#2a2e3e] p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4e6ef2] to-[#3ecf8e] flex items-center justify-center text-white text-[12px] font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#e4e9f7] truncate">Administrator</p>
            <p className="text-[11px] text-[#555e7a]">admin@bembex.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
