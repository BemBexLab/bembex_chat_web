"use client";

import React, { useState } from "react";

interface AdminLoginProps {
  onLogin?: (email: string, password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("admin_auth", JSON.stringify({ token: data.token, admin: data.admin }));
      // Set cookie for admin authentication
      document.cookie = `admin_token=${data.token}; path=/; SameSite=Strict; Secure`; // Secure only works on HTTPS
      window.location.href = "/admin-dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4e6ef2]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#3ecf8e]/20 rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#4e6ef2] to-[#3ecf8e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4e6ef2]/30">
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <h1 className="text-[28px] font-black text-[#e4e9f7] mb-2">Admin Panel</h1>
          <p className="text-[14px] text-[#8891aa]">Sign in to access the dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-2xl shadow-2xl shadow-black/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="mb-2 text-red-500 text-[13px] font-semibold">{error}</div>}
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@bembex.com"
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-xl px-4 py-3 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-xl px-4 py-3 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none transition-colors"
              />
            </div>

            {/* Remember & Forgot */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#2a2e3e] bg-[#252b40] text-[#4e6ef2] focus:ring-2 focus:ring-[#4e6ef2]/20"
                />
                <span className="text-[13px] text-[#8891aa]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[13px] text-[#4e6ef2] hover:text-[#3d5de0] font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#4e6ef2] to-[#3d5de0] text-white rounded-xl font-bold text-[15px] hover:shadow-lg hover:shadow-[#4e6ef2]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2e3e]" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-3 bg-[#1d2133] text-[#555e7a]">Admin Access Only</span>
            </div>
          </div>

          {/* Info */}
          <p className="text-center text-[12px] text-[#555e7a]">
            Protected area. Only authorized administrators can access.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#555e7a] mt-6">
          © 2026 BEMBEX. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;