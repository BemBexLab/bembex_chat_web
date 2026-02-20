"use client";

import React, { useState, useEffect, useRef } from "react";
import { searchUsers } from "@/lib/api";

interface User {
  _id: string;
  id?: string;
  username: string;
  email?: string;
}

interface TopBarProps {
  token?: string | null;
  onUserSelect?: (userId: string, userName: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ token, onUserSelect }) => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search users based on input (debounced)
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (token && searchInput.trim().length >= 2) {
        setLoadingUsers(true);
        try {
          const response = await searchUsers(searchInput, token);
          setFilteredUsers(response.users || []);
          setShowDropdown(true);
        } catch (err) {
          console.error("Failed to search users:", err);
          setFilteredUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      } else {
        setFilteredUsers([]);
        setShowDropdown(false);
      }
    }, 300); // Debounce: 300ms

    return () => clearTimeout(searchTimer);
  }, [searchInput, token]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserSelect = (userId: string, userName: string) => {
    setSearchInput("");
    setShowDropdown(false);
    if (onUserSelect) {
      onUserSelect(userId, userName);
    }
  };

  return (
    <div className="h-11 bg-[#141728] border-b border-[#1f2336] flex items-center px-3 gap-3 flex-shrink-0 sticky top-0 z-20">
      {/* Left: Brand */}
      <div className="flex items-center gap-2 w-40 flex-shrink-0">
        <span className="w-6 h-6 bg-[#4e6ef2] rounded-md flex items-center justify-center text-white font-black text-sm">
          B
        </span>
        <span className="text-[13px] font-black text-[#ccd4f5] tracking-widest hidden sm:block">
          BEMBEX
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center relative" ref={searchRef}>
        <div className="relative w-full max-w-sm">
          <div className="flex items-center bg-[#1d2133] border border-[#2a2e3e] rounded-lg px-3 gap-2 focus-within:border-[#4e6ef2] transition-colors">
            <svg
              className="w-3.5 h-3.5 text-[#555e7a] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search users (type to find...)"
              className="bg-transparent border-none outline-none text-[#8891aa] text-[12.5px] w-full py-1.5 font-[inherit] placeholder-[#555e7a]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => searchInput.trim() && setShowDropdown(true)}
            />
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1d2133] border border-[#2a2e3e] rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
              {loadingUsers ? (
                <div className="px-4 py-3 text-center text-[#8891aa] text-[12px]">
                  Loading users...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id || user._id}
                    onClick={() => handleUserSelect(user.id || user._id, user.username)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#252b40] transition-colors border-b border-[#2a2e3e] last:border-b-0 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4e6ef2] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#e4e9f7] truncate">
                        {user.username}
                      </div>
                      {user.email && (
                        <div className="text-[11px] text-[#8891aa] truncate">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-[#8891aa] text-[12px]">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions + Avatar */}
      <div className="flex items-center gap-1 w-40 justify-end">
        {/* <button className="w-6 h-6 bg-[#4e6ef2] rounded-md flex items-center justify-center text-white hover:bg-[#3d5de0] transition-colors mr-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button> */}

        {/* Notification */}
        {/* <button className="w-[30px] h-[30px] flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#1d2133] hover:text-[#ccd4f5] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button> */}

        {/* Settings */}
        {/* <button className="w-[30px] h-[30px] flex items-center justify-center text-[#8891aa] rounded-md hover:bg-[#1d2133] hover:text-[#ccd4f5] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button> */}

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[#4e6ef2] text-white text-[10px] font-bold flex items-center justify-center cursor-pointer ml-1">
          {/* AR */}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
