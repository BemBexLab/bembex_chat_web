"use client";

import React from "react";
import { Conversation } from "../types";

interface HeaderProps {
  conversation: Conversation | undefined;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ conversation, onMenuClick }) => {
  return (
    <div className="h-[52px] bg-[#1d2133] border-b border-[#2a2e3e] flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-10">
      {/* Left: hamburger + avatar + info */}
      <div className="flex items-center gap-2.5">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#2a2e3e] hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-[34px] h-[34px] rounded-lg bg-[#4e6ef2] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {conversation?.name?.slice(0, 2).toUpperCase() ?? "AR"}
        </div>

        {/* Name + status */}
        <div className="flex flex-col">
          <span className="text-[13.5px] font-semibold text-[#e4e9f7] leading-tight">
            {conversation?.name ?? "Abdul Rehman"}
          </span>
        </div>
      </div>

      {/* Right: action icons */}
      <div className="flex items-center gap-0.5">
        {/* Search */}
        {/* <button className="w-8 h-8 flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#2a2e3e] hover:text-[#ccd4f5] transition-colors" title="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button> */}

        {/* Call */}
        {/* <button className="w-8 h-8 flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#2a2e3e] hover:text-[#ccd4f5] transition-colors" title="Call">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 2.97 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button> */}

        {/* Video */}
        {/* <button className="w-8 h-8 flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#2a2e3e] hover:text-[#ccd4f5] transition-colors" title="Video Call">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button> */}

        {/* More */}
        {/* <button className="w-8 h-8 flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#2a2e3e] hover:text-[#ccd4f5] transition-colors" title="More">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1.2" fill="currentColor" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" />
          </svg>
        </button> */}
      </div>
    </div>
  );
};

export default Header;