"use client";

import React from "react";

type MobileTab = "chats" | "status" | "calls";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "chats",
      label: "Chats",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "status",
      label: "Status",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "calls",
      label: "Calls",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 2.97 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="md:hidden flex-shrink-0 h-16 bg-[#1a1f2e] border-t border-[#2a2e3e] flex items-center justify-around px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors ${
            activeTab === tab.id
              ? "text-[#4e6ef2]"
              : "text-[#555e7a]"
          }`}
        >
          {tab.icon}
          <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          {activeTab === tab.id && (
            <span className="w-1 h-1 rounded-full bg-[#4e6ef2]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default MobileBottomNav;