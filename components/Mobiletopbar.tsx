"use client";

import React, { useEffect, useRef, useState } from "react";
import { searchUsers } from "@/lib/api";

interface MobileTopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  token?: string | null;
  onUserSelect?: (userId: string, userName: string) => void;
  onLogout?: () => void;
  showSearch?: boolean;
}

interface User {
  _id: string;
  id?: string;
  username: string;
  email?: string;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  title,
  showBack,
  onBack,
  token,
  onUserSelect,
  onLogout,
  showSearch = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!showSearch || !token || searchInput.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await searchUsers(searchInput, token);
        setResults(res?.users || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, token, showSearch]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    const id = user.id || user._id;
    if (!id || !onUserSelect) return;
    onUserSelect(id, user.username);
    setSearchInput("");
    setSearchOpen(false);
  };

  return (
    <div className="md:hidden h-14 bg-[#1a1f2e] border-b border-[#2a2e3e] flex items-center justify-between px-4 flex-shrink-0 relative z-40">
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

      <div className="flex items-center gap-1" ref={searchWrapRef}>
        {/* Search */}
        {showSearch && (
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center text-[#8891aa] rounded-full hover:bg-[#2a2e3e] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        )}
        <button
          onClick={onLogout}
          className="w-9 h-9 flex items-center justify-center text-[#ef4444] rounded-full hover:bg-[#2a2e3e] transition-colors"
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {searchOpen && showSearch && (
          <div className="absolute top-[56px] left-0 right-0 bg-[#1d2133] border border-[#2a2e3e] rounded-lg shadow-2xl p-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[#111827] border border-[#2a2e3e] rounded-md px-3 py-2 text-[13px] text-[#e4e9f7] placeholder-[#555e7a] outline-none"
              autoFocus
            />
            <div className="mt-2 max-h-56 overflow-y-auto">
              {loading ? (
                <div className="text-center text-[12px] text-[#8891aa] py-3">Loading users...</div>
              ) : results.length ? (
                results.map((u) => (
                  <button
                    key={u.id || u._id}
                    onClick={() => handleSelect(u)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#252b40] transition-colors"
                  >
                    <div className="text-[13px] text-[#e4e9f7] font-semibold truncate">{u.username}</div>
                    {u.email && <div className="text-[11px] text-[#8891aa] truncate">{u.email}</div>}
                  </button>
                ))
              ) : searchInput.trim().length >= 2 ? (
                <div className="text-center text-[12px] text-[#8891aa] py-3">No users found</div>
              ) : (
                <div className="text-center text-[12px] text-[#8891aa] py-3">Type at least 2 characters</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTopBar;
