"use client";

import React, { useState, useEffect, useRef } from "react";
import { getAllUsers, getAdminConversations } from "@/lib/api";

interface User {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  status?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AdminTopBarProps {
  onLogout: () => void;
  token?: string | null;
  // third optional param conversationId: if present, navigate directly to that conversation
  onUserSelect?: (userId: string, userName: string, conversationId?: string) => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ onLogout, token, onUserSelect }) => {
  const [searchInput, setSearchInput] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectingUser, setSelectingUser] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all users on component mount
  useEffect(() => {
    if (token) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const response = await getAllUsers(token);
          console.log("[AdminTopbar] 📡 API Response structure:", response);
          
          if (response.users && response.users.length > 0) {
            const firstUser = response.users[0];
            console.log("[AdminTopbar] ✅ First user:", firstUser);
            console.log("[AdminTopbar] First user keys:", Object.keys(firstUser));
            console.log("[AdminTopbar] first.id =", firstUser.id, "first._id =", firstUser._id);
          }
          
          // Ensure users have proper ID field
          const usersWithId = (response.users || []).map((user: any) => ({
            ...user,
            id: user.id || user._id || '', // Fallback to ensure id exists
          }));
          
          setAllUsers(usersWithId);
          console.log("[AdminTopbar] ✅ Users loaded, count:", usersWithId.length);
          if (usersWithId.length > 0) {
            console.log("[AdminTopbar] First user after mapping:", usersWithId[0]);
          }
        } catch (err) {
          console.error("[AdminTopbar] ❌ Failed to fetch users:", err);
          setAllUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [token]);

  // Filter users based on search input
  useEffect(() => {
    if (searchInput.trim()) {
      const filtered = allUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchInput.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [searchInput, allUsers]);

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
    console.log("[AdminTopbar] ✅ User selected - userId:", userId, "userName:", userName);
    setSearchInput("");
    setShowDropdown(false);
    setSelectingUser(true);

    (async () => {
      try {
        if (!token) {
          console.warn("[AdminTopbar] No token available");
          if (onUserSelect) {
            onUserSelect(userId, userName); // No conversationId
          }
          setSelectingUser(false);
          return;
        }

        console.log("[AdminTopbar] Selected user ID:", userId, "User name:", userName);

        // Check if a previous conversation with this user exists
        try {
          const resp = await getAdminConversations(token, 1, 200);
          const conversations = resp.conversations || [];
          
          console.log("[AdminTopbar] Total conversations retrieved:", conversations.length);
          console.log("[AdminTopbar] Looking for conversation with otherUserId:", userId);
          
          // Log all conversations to debug
          conversations.forEach((conv: any, idx: number) => {
            console.log(`  [${idx}] otherUserId: ${conv.otherUserId}, otherUserName: ${conv.otherUserName}`);
          });
          
          // Find existing conversation with this user
          const existingConversation = conversations.find(
            (conv: any) => String(conv.otherUserId) === String(userId)
          );

          if (existingConversation) {
            // Conversation exists - continue the existing chat
            console.log(`[AdminTopbar] ✅ FOUND existing conversation with ${userName}:`, {
              conversationId: existingConversation.id || existingConversation._id,
              otherUserId: existingConversation.otherUserId,
            });
            if (onUserSelect) {
              onUserSelect(userId, userName, existingConversation.id || existingConversation._id);
            }
          } else {
            // No previous conversation - create a new chat
            console.log(`[AdminTopbar] ❌ NO existing conversation with ${userName}. Creating NEW chat.`);
            if (onUserSelect) {
              // Pass undefined explicitly for conversationId to signal NEW chat
              onUserSelect(userId, userName, undefined);
            }
          }
        } catch (conversationError) {
          console.error("[AdminTopbar] Error fetching admin conversations:", conversationError);
          // If we fail to check conversations, still allow user to chat (assume new)
          if (onUserSelect) {
            onUserSelect(userId, userName, undefined);
          }
        }
      } catch (error) {
        console.error("[AdminTopbar] Error in handleUserSelect:", error);
        // Fallback: still attempt to select the user
        if (onUserSelect) {
          onUserSelect(userId, userName, undefined);
        }
      } finally {
        setSelectingUser(false);
      }
    })();
  };
  return (
    <div className="h-16 bg-[#1d2133] border-b border-[#2a2e3e] flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="relative w-80" ref={searchRef}>
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
              <>
                {filteredUsers.map((user) => (
                  <button
                    key={user.id || Math.random()}
                    onClick={() => {
                      const clickedUserId = user.id;
                      console.log("[AdminTopbar] 🔴 Button CLICKED for user:", user.username);
                      console.log("[AdminTopbar] Extracted userId:", clickedUserId);
                      if (!clickedUserId) {
                        console.error("[AdminTopbar] ❌ ERROR: userId is undefined for user:", user.username);
                        alert("Error: User ID not found. Please try again.");
                        return;
                      }
                      console.log("[AdminTopbar] ✅ Calling handleUserSelect:", { userId: clickedUserId, username: user.username });
                      handleUserSelect(clickedUserId, user.username);
                    }}
                    disabled={selectingUser}
                    className={`w-full px-4 py-2.5 text-left hover:bg-[#252b40] transition-colors border-b border-[#2a2e3e] last:border-b-0 flex items-center gap-2 ${
                      selectingUser ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-center text-[#8891aa] text-[12px]">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center text-[#8891aa] rounded-lg hover:bg-[#252b40] hover:text-[#ccd4f5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border border-[#1d2133]" />
        </button>

        {/* Settings */}
        <button className="w-10 h-10 flex items-center justify-center text-[#8891aa] rounded-lg hover:bg-[#252b40] hover:text-[#ccd4f5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m8.66-13.32l-4.24 4.24m0 6.36l4.24 4.24M23 12h-6m-6 0H1m12.68-8.66l-4.24 4.24m0 6.36l-4.24 4.24" />
          </svg>
        </button>

        {/* Logout */}
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
      </div>
    </div>
  );
};

export default AdminTopBar;