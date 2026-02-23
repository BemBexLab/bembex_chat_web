"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAdminConversations, getAllUsers, searchUsers } from "@/lib/api";

interface User {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
}

interface AdminTopBarProps {
  onLogout: () => void;
  token?: string | null;
  onUserSelect?: (userId: string, userName: string, conversationId?: string) => void;
  showLogout?: boolean;
  showSearch?: boolean;
}

const normalizeId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.id) return String(value.id);
    if (value._id) return String(value._id);
  }
  return "";
};

const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onLogout,
  token,
  onUserSelect,
  showLogout = true,
  showSearch = true,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectingUser, setSelectingUser] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await getAllUsers(token);
        const usersWithId = (response.users || []).map((user: any) => ({
          ...user,
          id: normalizeId(user),
        }));
        setAllUsers(usersWithId);
      } catch {
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = searchInput.trim();
      if (!token || query.length < 2) {
        setFilteredUsers([]);
        setShowDropdown(false);
        setLoadingUsers(false);
        return;
      }

      setLoadingUsers(true);
      try {
        // Primary path: same live-search behavior as mobile search bar.
        const response = await searchUsers(query, token);
        const users = (response.users || []).map((user: any) => ({
          ...user,
          id: normalizeId(user),
        }));
        setFilteredUsers(users);
        setShowDropdown(true);
      } catch {
        // Fallback path: local filtering from preloaded users.
        const lower = query.toLowerCase();
        const filtered = allUsers.filter(
          (user) =>
            user.username?.toLowerCase().includes(lower) ||
            user.email?.toLowerCase().includes(lower)
        );
        setFilteredUsers(filtered);
        setShowDropdown(true);
      } finally {
        setLoadingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, token, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserSelect = async (selectedUser: User) => {
    if (!onUserSelect) return;

    const userId = normalizeId(selectedUser);
    const userName = selectedUser.username;
    if (!userId || !userName) return;

    setSearchInput("");
    setShowDropdown(false);
    setSelectingUser(true);

    try {
      if (!token) {
        onUserSelect(userId, userName, undefined);
        return;
      }

      const response = await getAdminConversations(token, 1, 500);
      const conversations = response.conversations || [];
      const existingConversation = conversations.find(
        (conv: any) => normalizeId(conv.otherUserId) === userId
      );

      if (existingConversation) {
        onUserSelect(userId, userName, normalizeId(existingConversation));
      } else {
        onUserSelect(userId, userName, undefined);
      }
    } catch {
      onUserSelect(userId, userName, undefined);
    } finally {
      setSelectingUser(false);
    }
  };

  return (
    <div className="h-16 bg-[#1d2133] border-b border-[#2a2e3e] flex items-center justify-between px-6 flex-shrink-0">
      <div className="relative w-80" ref={searchRef}>
        {showSearch && (
          <>
            <div className="flex items-center bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3 gap-2 focus-within:border-[#4e6ef2] transition-colors">
              <svg className="w-4 h-4 text-[#555e7a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                className="bg-transparent border-none outline-none text-[#ccd4f5] text-[13px] w-full py-2.5 font-[inherit] placeholder-[#555e7a]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => searchInput.trim().length >= 2 && setShowDropdown(true)}
              />
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1d2133] border border-[#2a2e3e] rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {loadingUsers ? (
                  <div className="px-4 py-3 text-center text-[#8891aa] text-[12px]">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={normalizeId(user) || `${user.username}-${user.email || "no-email"}`}
                      onClick={() => handleUserSelect(user)}
                      disabled={selectingUser}
                      className={`w-full px-4 py-2.5 text-left hover:bg-[#252b40] transition-colors border-b border-[#2a2e3e] last:border-b-0 flex items-center gap-2 ${
                        selectingUser ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#4e6ef2] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#e4e9f7] truncate">{user.username}</div>
                        {user.email && <div className="text-[11px] text-[#8891aa] truncate">{user.email}</div>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-[#8891aa] text-[12px]">
                    {searchInput.trim().length < 2 ? "Type at least 2 characters" : "No users found"}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/20 transition-colors ml-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[13px] font-semibold">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTopBar;
