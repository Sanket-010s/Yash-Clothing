"use client";

import Link from "next/link";

export default function LoginPrompt({ message = "Please login to continue.", onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text-primary">Login Required</h2>
        <p className="text-sm text-slate-500">{message}</p>
        <div className="flex gap-3">
          <Link href="/auth/login" className="btn-primary flex-1 text-center">
            Login
          </Link>
          <Link href="/auth/register" className="btn-secondary flex-1 text-center">
            Register
          </Link>
        </div>
        <button type="button" onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
