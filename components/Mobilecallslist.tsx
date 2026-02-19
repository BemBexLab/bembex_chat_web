"use client";

import React from "react";

const CALLS_DATA = [
  { id: "1", name: "Abdul Rehman", type: "incoming", time: "Today, 12:05 PM", missed: false },
  { id: "2", name: "Raza Abbas", type: "outgoing", time: "Today, 11:20 AM", missed: false },
  { id: "3", name: "David Warner", type: "incoming", time: "Today, 9:45 AM", missed: true },
  { id: "4", name: "Clark", type: "outgoing", time: "Today, 7:00 AM", missed: false },
  { id: "5", name: "Syed Waqas Amin", type: "incoming", time: "Yesterday, 6:30 PM", missed: true },
  { id: "6", name: "M. Musab", type: "outgoing", time: "Yesterday, 3:00 PM", missed: false },
];

const MobileCallsList: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#111827]">
      {CALLS_DATA.map((call) => (
        <div
          key={call.id}
          className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2536] hover:bg-[#161d2e] transition-colors"
        >
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#2a3152] text-[#8891aa] text-[14px] font-bold flex items-center justify-center flex-shrink-0">
            {call.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Call info */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-[#e4e9f7] truncate">
              {call.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Direction arrow */}
              {call.type === "incoming" ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={call.missed ? "#ef4444" : "#3ecf8e"}
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 19 19 12" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4e6ef2"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 5 5 12" />
                </svg>
              )}
              <span
                className={`text-[12px] ${
                  call.missed ? "text-[#ef4444]" : "text-[#555e7a]"
                }`}
              >
                {call.missed ? "Missed" : call.type === "incoming" ? "Incoming" : "Outgoing"}{" "}
                · {call.time}
              </span>
            </div>
          </div>

          {/* Call back button */}
          <button className="w-9 h-9 flex items-center justify-center text-[#4e6ef2] rounded-full hover:bg-[#2a2e3e] transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 2.97 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default MobileCallsList;