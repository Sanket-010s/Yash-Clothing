"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api.register(form);
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
        <h1 className="text-page-title text-[1.5rem]">Create Account</h1>
        <div>
          <label htmlFor="name" className="label">
            Name <span className="text-accent">*</span>
          </label>
          <input
            id="name"
            className="input"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
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
          {busy ? "Creating account..." : "Register"}
        </button>
        <p className="text-body text-text-secondary">
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold text-primary">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
