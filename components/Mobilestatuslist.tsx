"use client";

import React from "react";

const STATUS_DATA = [
  { id: "1", name: "Syed Waqas Amin", time: "Today, 9:00 am", seen: false },
  { id: "2", name: "Raza Abbas", time: "Today, 10:15 am", seen: false },
  { id: "3", name: "Ahmed Sarib", time: "Today, 11:30 am", seen: true },
  { id: "4", name: "M. Musab", time: "Today, 12:45 pm", seen: true },
  { id: "5", name: "Sarim Khan", time: "Yesterday, 6:00 pm", seen: true },
];

const MobileStatusList: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#111827]">
      {/* My status */}
      <div className="px-4 py-3 border-b border-[#1e2536]">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#2a3152] text-[#8891aa] text-[14px] font-bold flex items-center justify-center">
              AR
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#4e6ef2] border-2 border-[#111827] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="3" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="3" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#e4e9f7]">My Status</p>
            <p className="text-[12px] text-[#555e7a]">Tap to add status update</p>
          </div>
        </div>
      </div>

      {/* Recent updates */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[12px] font-semibold text-[#4e6ef2] uppercase tracking-wider mb-2">
          Recent Updates
        </p>
      </div>

      {STATUS_DATA.filter((s) => !s.seen).map((status) => (
        <button
          key={status.id}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#1e2536] hover:bg-[#161d2e] transition-colors"
        >
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#4e6ef2] to-[#3ecf8e] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#2a3152] flex items-center justify-center text-[#aab3d4] text-[13px] font-bold">
              {status.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="text-left">
            <p className="text-[15px] font-semibold text-[#e4e9f7]">{status.name}</p>
            <p className="text-[12px] text-[#555e7a]">{status.time}</p>
          </div>
        </button>
      ))}

      {/* Viewed updates */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[12px] font-semibold text-[#555e7a] uppercase tracking-wider mb-2">
          Viewed Updates
        </p>
      </div>

      {STATUS_DATA.filter((s) => s.seen).map((status) => (
        <button
          key={status.id}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#1e2536] hover:bg-[#161d2e] transition-colors"
        >
          <div className="w-12 h-12 rounded-full p-0.5 bg-[#2a2e3e] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#2a3152] flex items-center justify-center text-[#555e7a] text-[13px] font-bold">
              {status.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="text-left">
            <p className="text-[15px] font-semibold text-[#8891aa]">{status.name}</p>
            <p className="text-[12px] text-[#555e7a]">{status.time}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MobileStatusList;