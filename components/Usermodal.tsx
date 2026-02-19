"use client";

import React, { useState, useEffect } from "react";
import { AdminUser } from "@/types/admin";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<AdminUser>) => void;
  editUser?: AdminUser | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editUser }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    status: "active" as "active" | "suspended",
  });

  useEffect(() => {
    if (editUser) {
      setFormData({
        username: editUser.username,
        email: editUser.email,
        password: "",
        status: editUser.status,
      });
    } else {
      setFormData({ username: "", email: "", password: "", status: "active" });
    }
  }, [editUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editUser ? { ...formData, id: editUser.id } : formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-2xl w-full max-w-md shadow-2xl shadow-black/40 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2e3e]">
          <h2 className="text-[18px] font-bold text-[#e4e9f7]">
            {editUser ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8891aa] hover:bg-[#252b40] hover:text-[#e4e9f7] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none transition-colors"
                placeholder="Enter username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none transition-colors"
                placeholder="user@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-1.5">
                Password {editUser && <span className="text-[#555e7a]">(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editUser}
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none transition-colors"
                placeholder="Enter password"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "suspended" })}
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e4e9f7] focus:border-[#4e6ef2] focus:outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#252b40] text-[#8891aa] rounded-lg hover:bg-[#2a3152] hover:text-[#ccd4f5] font-medium text-[14px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4e6ef2] to-[#3d5de0] text-white rounded-lg hover:shadow-lg hover:shadow-[#4e6ef2]/30 font-semibold text-[14px] transition-all"
            >
              {editUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;