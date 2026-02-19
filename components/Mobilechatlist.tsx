"use client";

import React from "react";
import { Conversation } from "../types";

interface MobileChatListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  isAdmin?: boolean;
}


const MobileChatList: React.FC<MobileChatListProps> = ({
  conversations,
  activeId,
  onSelect,
  isAdmin = false,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#111827]">
      {conversations.map((conv, idx) => {
        const isActive = conv.id === activeId;
        const metaText = conv.lastMessage || "";
        const metaTime = conv.lastMessageTime || "";
        const statusText = conv.online ? "Available" : "Offline";

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#1e2536] text-left transition-colors ${
              isActive ? "bg-[#1e2a42]" : "hover:bg-[#161d2e]"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#2a3152] text-[#8891aa] text-[14px] font-bold flex items-center justify-center">
                {conv.name.slice(0, 2).toUpperCase()}
              </div>
              {isAdmin && (conv.online ? (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#3ecf8e] border-2 border-[#111827]" title="Online" />
              ) : (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#8891aa] border-2 border-[#111827]" title="Offline" />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[15px] font-semibold text-[#e4e9f7] truncate">
                  {conv.name}
                </span>
                {isAdmin && <span
                  className={`text-[11px] flex-shrink-0 ml-2 ${conv.online ? "text-[#3ecf8e]" : "text-[#555e7a]"}`}
                >
                  {statusText}
                </span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#8891aa] truncate pr-2">
                  {metaText}
                </span>
                {Number(conv.unread) > 0 && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-[#3ecf8e] text-[#111827] text-[11px] font-bold flex items-center justify-center px-1.5">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MobileChatList;