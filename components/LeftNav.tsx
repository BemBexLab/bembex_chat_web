"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const LeftNav: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="hidden md:flex w-14 min-w-[56px] bg-[#1a1e2e] border-r border-[#2a2e3e] flex-col items-center py-2 h-full sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-9 h-9 bg-[#4e6ef2] rounded-lg flex items-center justify-center text-white font-black text-base">
          B
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {/* Home */}
        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-[#8891aa] hover:bg-[#2a2e3e] hover:text-white transition-colors text-lg" title="Remote Work">
          🏠
        </button>
        {/* Chat - active */}
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a2e3e] text-[#4e6ef2] transition-colors text-lg" title="Chat">
          💬
        </button>
        {/* Channels */}
        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-[#8891aa] hover:bg-[#2a2e3e] hover:text-white transition-colors text-lg" title="Channels">
          📢
        </button>
      </nav>

      {/* Bottom avatar / profile */}
      <div className="mt-auto pb-2 flex flex-col items-center">
        <Link href="/profile">
          <div className="w-8 h-8 rounded-full bg-[#4e6ef2] text-white text-[11px] font-semibold flex items-center justify-center cursor-pointer">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || "U"}
          </div>
        </Link>
        <button
          onClick={logout}
          className="text-xs text-red-500 mt-1"
          title="Log out"
        >
          ⏻
        </button>
      </div>
    </div>
  );
};

export default LeftNav;