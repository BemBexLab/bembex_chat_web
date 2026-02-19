"use client";

import React from "react";
import { DashboardStats } from "@/types/admin";

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "from-[#4e6ef2] to-[#3d5de0]",
      bg: "bg-[#4e6ef2]/10",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      color: "from-[#3ecf8e] to-[#2ab574]",
      bg: "bg-[#3ecf8e]/10",
    },
    {
      label: "Suspended",
      value: stats.suspendedUsers,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
      color: "from-[#ef4444] to-[#dc2626]",
      bg: "bg-[#ef4444]/10",
    },
    {
      label: "Conversations",
      value: stats.totalConversations,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      color: "from-[#f59e0b] to-[#d97706]",
      bg: "bg-[#f59e0b]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={card.label}
          className="bg-[#1d2133] border border-[#2a2e3e] rounded-xl p-5 hover:border-[#4e6ef2]/30 transition-all hover:shadow-lg hover:shadow-[#4e6ef2]/5"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center`}>
              <div className={`bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                {card.icon}
              </div>
            </div>
          </div>
          <h3 className="text-[28px] font-black text-[#e4e9f7] mb-1 bg-gradient-to-br from-white to-[#8891aa] bg-clip-text text-transparent">
            {card.value}
          </h3>
          <p className="text-[13px] text-[#8891aa] font-medium">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;