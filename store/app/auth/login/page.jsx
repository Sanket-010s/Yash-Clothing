"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api.login(form);
      setSession({ token: data.access_token, user: data.user });
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell py-6">
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
        <h1 className="text-page-title text-[1.5rem]">Login</h1>
        <div>
          <label htmlFor="email" className="label">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password <span className="text-accent">*</span>
          </label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
        <p className="text-body text-text-secondary">
          New user?{" "}
          <Link href="/auth/register" className="font-semibold text-primary">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
