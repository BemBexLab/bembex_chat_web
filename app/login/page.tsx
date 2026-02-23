"use client";

import React, { useState } from "react";

interface UserLoginProps {
  onLogin?: (email: string, password: string) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();

      // Check if user is suspended
      if (data.user?.suspended) {
        setError("Your account has been suspended. Please contact support.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("auth", JSON.stringify({ token: data.token, user: data.user }));
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRedirect = () => {
    window.location.href = "/admin-login/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161929] to-[#1a1f2e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4e6ef2]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#3ecf8e]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4e6ef2]/5 rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-[#4e6ef2] to-[#3ecf8e] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#4e6ef2]/40 animate-float">
            <span className="text-white font-black text-3xl">B</span>
          </div>
          <h1 className="text-[32px] font-black text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-[15px] text-[#8891aa]">Sign in to continue to BEMBEX Chat</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1d2133]/80 backdrop-blur-xl border border-[#2a2e3e] rounded-2xl shadow-2xl shadow-black/60 p-8 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4e6ef2]/5 via-transparent to-[#3ecf8e]/5 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && <div className="mb-2 text-red-500 text-[13px] font-semibold">{error}</div>}
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555e7a]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none focus:ring-2 focus:ring-[#4e6ef2]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#8891aa] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555e7a]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-[#252b40] border border-[#2a2e3e] rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-[#e4e9f7] placeholder-[#555e7a] focus:border-[#4e6ef2] focus:outline-none focus:ring-2 focus:ring-[#4e6ef2]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555e7a] hover:text-[#8891aa] transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#2a2e3e] bg-[#252b40] text-[#4e6ef2] focus:ring-2 focus:ring-[#4e6ef2]/20 transition-all"
                />
                <span className="text-[13px] text-[#8891aa] group-hover:text-[#ccd4f5] transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[13px] text-[#4e6ef2] hover:text-[#3d5de0] font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#4e6ef2] to-[#3d5de0] text-white rounded-xl font-bold text-[15px] hover:shadow-xl hover:shadow-[#4e6ef2]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2e3e]" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-3 bg-[#1d2133] text-[#555e7a]">or</span>
            </div>
          </div> */}

          {/* Social Login (Optional) */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#252b40] border border-[#2a2e3e] rounded-xl hover:bg-[#2a3152] hover:border-[#4e6ef2]/30 transition-all group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#8891aa] group-hover:text-[#4e6ef2] transition-colors">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#8891aa] group-hover:text-[#ccd4f5] transition-colors">Google</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#252b40] border border-[#2a2e3e] rounded-xl hover:bg-[#2a3152] hover:border-[#4e6ef2]/30 transition-all group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#8891aa] group-hover:text-[#4e6ef2] transition-colors">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#8891aa] group-hover:text-[#ccd4f5] transition-colors">GitHub</span>
            </button>
          </div> */}
        </div>

        {/* Admin Link */}
        <button
          onClick={handleAdminRedirect}
          className="w-full mt-4 text-center text-[13px] text-[#555e7a] hover:text-[#4e6ef2] transition-colors flex items-center justify-center gap-2 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-[#4e6ef2]">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          Admin? Sign in here
        </button>

        {/* Footer */}
        {/* <p className="text-center text-[12px] text-[#555e7a] mt-6">
          Don't have an account?{" "}
          <button className="text-[#4e6ef2] hover:text-[#3d5de0] font-semibold transition-colors">
            Sign up
          </button>
        </p> */}

        <p className="text-center text-[11px] text-[#555e7a] mt-6">
          © 2026 BEMBEX. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default UserLogin;