"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.replace("/chat");
    }
  }, [loading, token, router]);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-6">Welcome to Chat App</h1>
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </main>
    </div>
  );
}
