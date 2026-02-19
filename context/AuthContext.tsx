"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, fetchProfile, logout as apiLogout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setToken(data.token);
        setUser(data.user);
      } catch {
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await apiLogin(email, password);
    setToken(resp.token);
    const profile = await fetchProfile(resp.token);
    const userData: UserProfile = {
      id: profile._id || profile.id,
      username: profile.username || profile.email,
      email: profile.email,
      suspended: false
    };
    setUser(userData);
    localStorage.setItem("auth", JSON.stringify({ token: resp.token, user: userData }));
    router.push("/chat");
  };

  const logout = async () => {
    if (token) {
      try {
        await apiLogout(token);
      } catch (e) {
        // Optionally handle error
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth");
    // Clear user token cookies
    document.cookie = "user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Also clear admin_auth in case of mixed sessions
    localStorage.removeItem("admin_auth");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
