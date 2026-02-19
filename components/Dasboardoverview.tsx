"use client";

import React, { useState, useEffect } from "react";
import StatsCards from "@/components/Statscards";
import { DashboardStats } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

const MOCK_STATS: DashboardStats = {
  totalUsers: 127,
  activeUsers: 98,
  suspendedUsers: 29,
  totalConversations: 456,
};

interface Activity {
  id: string;
  type: 'user_login' | 'user_logout';
  user: string;
  userEmail: string;
  action: string;
  time: string;
  timestamp: string;
}

interface DashboardOverviewProps {
  onViewChatsClick?: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onViewChatsClick }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: userToken } = useAuth();
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminAuth = localStorage.getItem("admin_auth");
      if (adminAuth) {
        try {
          const data = JSON.parse(adminAuth);
          setAdminToken(data.token);
        } catch {
          setAdminToken(null);
        }
      }
    }
  }, []);

  const effectiveToken = userToken || adminToken;

  const fetchActivities = async () => {
    if (!effectiveToken) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/activity", {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await res.json();
      // Only keep login/logout activities (should already be filtered by backend, but double check)
      setActivities((data.activities || []).filter((a: Activity) => a.type === 'user_login' || a.type === 'user_logout'));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message);
      // Fallback to mock data if API fails
      setActivities([
        { id: "1", type: "user_login", user: "Abdul Rehman", userEmail: "abdul@example.com", action: "User logged in", time: "2 hours ago", timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString() },
        { id: "2", type: "user_logout", user: "Abdul Rehman", userEmail: "abdul@example.com", action: "User logged out", time: "1 hour ago", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
      ]);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [effectiveToken]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-black text-[#e4e9f7] mb-1">Dashboard Overview</h1>
        <p className="text-[13px] text-[#8891aa]">Monitor system activity and user statistics</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={MOCK_STATS} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex justify-end items-end">
        {/* Activity Feed */}
        {/* <div className="lg:col-span-2 bg-[#1d2133] border border-[#2a2e3e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2e3e] flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#e4e9f7]">Recent Activity</h2>
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="p-2 hover:bg-[#2a2e3e] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh activities"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-[#8891aa] ${loading ? 'animate-spin' : ''}`}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
              </svg>
            </button>
          </div>
          <div className="divide-y divide-[#2a2e3e]">
            {loading ? (
              <div className="px-6 py-8 text-center text-[#8891aa]">
                <p>Loading activities...</p>
              </div>
            ) : error && activities.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#ef4444]">
                <p>Failed to load activities. Showing fallback data...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#8891aa]">
                <p>No activities yet</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-[#252b40]/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === "user_login"
                          ? "bg-[#4e6ef2]/10"
                          : "bg-[#ef4444]/10"
                      }`}
                    >
                      {activity.type === "user_login" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4e6ef2" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                      {activity.type === "user_logout" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#e4e9f7] mb-0.5">{activity.user}</p>
                      <p className="text-[13px] text-[#8891aa]">{activity.action}</p>
                      <p className="text-[11px] text-[#555e7a]">{activity.userEmail}</p>
                    </div>
                    <span className="text-[11px] text-[#555e7a] flex-shrink-0">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}

        {/* Quick Actions */}
        <div className="bg-[#1d2133] border border-[#2a2e3e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2e3e]">
            <h2 className="text-[16px] font-bold text-[#e4e9f7]">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#4e6ef2]/10 to-transparent border border-[#4e6ef2]/20 rounded-lg hover:border-[#4e6ef2]/40 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-[#4e6ef2]/20 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4e6ef2" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#e4e9f7]">Create User</p>
                <p className="text-[11px] text-[#8891aa]">Add new user account</p>
              </div>
            </button>

            <button 
              onClick={onViewChatsClick}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#3ecf8e]/10 to-transparent border border-[#3ecf8e]/20 rounded-lg hover:border-[#3ecf8e]/40 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/20 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#e4e9f7]">View Chats</p>
                <p className="text-[11px] text-[#8891aa]">View all active chats</p>
              </div>
            </button>

            {/* <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/20 rounded-lg hover:border-[#f59e0b]/40 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#e4e9f7]">Export Report</p>
                <p className="text-[11px] text-[#8891aa]">Generate user report</p>
              </div>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;