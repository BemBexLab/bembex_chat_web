"use client";

import React from "react";

interface MobileTopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ title, showBack, onBack }) => {
  return (
    <div className="md:hidden h-14 bg-[#1a1f2e] border-b border-[#2a2e3e] flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center text-[#4e6ef2] rounded-lg hover:bg-[#2a2e3e] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : (
          <span className="w-8 h-8 bg-[#4e6ef2] rounded-lg flex items-center justify-center text-white font-black text-sm">
            B
          </span>
        )}
        <h1 className="text-[17px] font-bold text-[#e4e9f7] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Search */}
        <button className="w-9 h-9 flex items-center justify-center text-[#8891aa] rounded-full hover:bg-[#2a2e3e] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {/* More */}
        <button className="w-9 h-9 flex items-center justify-center text-[#8891aa] rounded-full hover:bg-[#2a2e3e] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;