"use client";

import React, { useState } from "react";
import { AdminUser } from "@/types/admin";
import UserModal from "@/components/Usermodal";

// const MOCK_USERS: AdminUser[] = [
//   { id: "1", username: "abdul_rehman", email: "abdul@bembex.com", status: "active", createdAt: "2024-01-15", lastLogin: "2024-02-17 10:30" },
//   { id: "2", username: "waqas_amin", email: "waqas@bembex.com", status: "active", createdAt: "2024-01-18", lastLogin: "2024-02-16 15:45" },
//   { id: "3", username: "raza_abbas", email: "raza@bembex.com", status: "suspended", createdAt: "2024-01-20", lastLogin: "2024-02-10 09:20" },
//   { id: "4", username: "ahmed_sarib", email: "ahmed@bembex.com", status: "active", createdAt: "2024-01-22", lastLogin: "2024-02-17 11:15" },
//   { id: "5", username: "m_musab", email: "musab@bembex.com", status: "active", createdAt: "2024-02-01", lastLogin: "2024-02-17 08:00" },
// ];

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const getToken = () => {
    const auth = typeof window !== "undefined" ? localStorage.getItem("admin_auth") : null;
    if (!auth) return null;
    return JSON.parse(auth).token;
  };

  React.useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${apiBase}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch users"))
      .then(data => setUsers(data.users || []))
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateUser = () => {
    if (loading) return;
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    if (loading) return;
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUserWrapper = async (userData: Partial<AdminUser>) => {
    await handleSaveUser(userData);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (userData: Partial<AdminUser>) => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      if (editingUser) {
        // Edit existing user
        const response = await fetch(`${apiBase}/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            status: userData.status,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Failed to update user");
        }

        const result = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? result.user : u));
      } else {
        // Create new user
        const formData = userData as Record<string, any>;
        const response = await fetch(`${apiBase}/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: formData.password || "default123",
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Failed to create user");
        }

        const result = await response.json();
        setUsers([...users, result.user]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to delete user");
      }

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const newStatus = user.status === "active" ? "suspended" : "active";

    try {
      const response = await fetch(`${apiBase}/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to update user status");
      }

      const result = await response.json();
      setUsers(users.map(u => u.id === user.id ? result.user : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (userId: string) => {
    if (!confirm('Force logout this user? They will be disconnected and need to log in again.')) return;

    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/admin/users/${userId}/force-logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to force logout');
      }

      alert('User has been forcefully logged out');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black text-[#e4e9f7] mb-1">User Management</h1>
          <p className="text-[13px] text-[#8891aa]">Manage all users and their permissions</p>
        </div>
        <button
          onClick={handleCreateUser}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4e6ef2] to-[#3d5de0] text-white rounded-lg hover:shadow-lg hover:shadow-[#4e6ef2]/30 font-semibold text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create User
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-4 py-3 text-[14px] text-[#ef4444] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[#ef4444] hover:text-[#ef4444]/80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3 gap-2 focus-within:border-[#4e6ef2] transition-colors">
          <svg className="w-4 h-4 text-[#555e7a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[#ccd4f5] text-[13px] w-full py-2.5 font-[inherit] placeholder-[#555e7a]"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[#252b40] border border-[#2a2e3e] rounded-lg px-4 py-2.5 text-[13px] text-[#ccd4f5] focus:border-[#4e6ef2] focus:outline-none transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#252b40] border-b border-[#2a2e3e]">
                <th className="text-left px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Username</th>
                <th className="text-left px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Created</th>
                <th className="text-left px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Force Logout</th>
                <th className="text-right px-6 py-3.5 text-[12px] font-bold text-[#8891aa] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={`${user.id}-${user.email}`} className="border-b border-[#2a2e3e] hover:bg-[#252b40]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4e6ef2] to-[#3ecf8e] flex items-center justify-center text-white text-[12px] font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[14px] font-semibold text-[#e4e9f7]">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#8891aa]">{user.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.status === "active"
                          ? "bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e]/20 disabled:hover:bg-[#3ecf8e]/10"
                          : "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 disabled:hover:bg-[#ef4444]/10"
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#8891aa]">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleForceLogout(user.id)}
                      disabled={loading}
                      className="px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide bg-[#ffb86b]/10 text-[#ffb86b] hover:bg-[#ffb86b]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Force Logout"
                    >
                      Force Logout
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center text-[#4e6ef2] rounded-lg hover:bg-[#4e6ef2]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center text-[#ef4444] rounded-lg hover:bg-[#ef4444]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#252b40] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555e7a" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[14px] text-[#8891aa]">No users found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUserWrapper}
        editUser={editingUser}
      />
    </div>
  );
};

export default UsersManagement;
