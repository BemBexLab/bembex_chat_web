"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword } from "@/lib/api";

const ProfilePage: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState<string | null>(null);
  const [pwdOld, setPwdOld] = useState("");
  const [pwdNew, setPwdNew] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await updateProfile(token, { username, email });
      setMessage("Profile updated");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await changePassword(token, pwdOld, pwdNew);
      setMessage("Password changed");
      setPwdOld("");
      setPwdNew("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={handleProfileSave} className="mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </form>

      <h2 className="text-xl font-semibold mb-3">Change password</h2>
      <form onSubmit={handleChangePwd}>
        <div className="mb-3">
          <label className="block text-sm">Current password</label>
          <input
            type="password"
            value={pwdOld}
            onChange={(e) => setPwdOld(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm">New password</label>
          <input
            type="password"
            value={pwdNew}
            onChange={(e) => setPwdNew(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Update password
        </button>
      </form>

      <button
        onClick={logout}
        className="mt-6 text-red-600 underline"
      >
        Log out
      </button>
    </div>
  );
};

export default ProfilePage;
