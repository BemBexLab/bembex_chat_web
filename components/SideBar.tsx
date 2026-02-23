"use client";

import React from "react";
import { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, activeId, onSelect, isAdmin = false, onLogout }) => {
  return (
    <div className="chat-scrollbar w-[220px] min-w-[220px] bg-[#1d2133] border-r border-[#2a2e3e] flex flex-col h-full overflow-y-auto">
      {/* Workspace header */}
      <div className="px-3.5 py-3 border-b border-[#2a2e3e] flex-shrink-0">
        <span className="text-[13px] font-bold text-[#ccd4f5] tracking-[0.3px]">
          Remote Work
        </span>
      </div>

      {/* My Pins */}
      <div className="px-3.5 pt-2.5 pb-0">
        <p className="text-[12px] font-semibold text-[#8891aa] mb-0.5">My Pins</p>
        <p className="text-[10.5px] text-[#555e7a] leading-snug mb-2">
          Keep your favorite chats within easy reach
        </p>
      </div>

      {/* Conversations label */}
      <div className="px-3.5 pt-2">
        <p className="text-[11px] font-bold text-[#8891aa] uppercase tracking-[0.5px] mb-1.5">
          Conversations
        </p>

        {/* Conversation list */}
        <div className="flex flex-col gap-px">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md w-full text-left transition-colors ${
                activeId === conv.id
                  ? "bg-[#2a3152]"
                  : "hover:bg-[#252b40]"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-md bg-[#3a4060] text-[#aab3d4] text-[10px] font-semibold flex items-center justify-center">
                  {conv.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Name + badge */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[12.5px] truncate ${
                      activeId === conv.id
                        ? "text-white font-semibold"
                        : "text-[#bbc6e8]"
                    }`}
                  >
                    {conv.name}
                  </span>
                  {conv.unread && conv.unread > 0 ? (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#4e6ef2] text-white text-[10px] font-bold flex items-center justify-center px-1 flex-shrink-0">
                      {conv.unread}
                    </span>
                  ) : null}
                </div>
                {conv.lastMessage && (
                  <div className="text-[10.5px] text-[#8891aa] truncate">
                    {conv.lastMessage}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Show all link */}
      <div className="px-3.5 py-2">
        <button className="text-[11px] text-[#4e6ef2] hover:underline">
          Show all
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout (replaces Threads) - hidden for admin */}
      <div className="border-t border-[#2a2e3e] px-3.5 pt-3 pb-4">
        {!isAdmin ? (
          <div className="px-0">
            <button
              onClick={() => {
                if (onLogout) return onLogout();
                // default logout behaviour for regular users
                if (typeof window !== "undefined") {
                  if (confirm("Are you sure you want to logout?")) {
                    localStorage.removeItem("auth");
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                    window.location.href = "/login";
                  }
                }
              }}
              className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-md text-[13px] font-semibold text-[#ef4444] bg-[#221c22] hover:bg-[#2b2430] hover:text-white transition-colors"
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ef4444]">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
