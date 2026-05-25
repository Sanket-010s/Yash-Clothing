"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .getMe()
      .then((freshUser) => setSession({ token, user: freshUser }))
      .catch((err) => setError(err.message));
  }, [token, setSession]);

  if (!token || !user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Please login to access your profile.</p>
        <Link href="/auth/login" className="mt-3 inline-block text-sm font-semibold text-brand-700">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <section className="card space-y-2">
        <p className="text-sm">
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Role:</span> {user.role}
        </p>
      </section>
      <div className="flex gap-2">
        <Link href="/orders" className="btn-secondary">
          My Orders
        </Link>
        <button type="button" className="btn-primary" onClick={clearSession}>
          Logout
        </button>
      </div>
    </div>
  );
}
