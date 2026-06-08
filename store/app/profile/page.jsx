"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const emptyAddress = { label: "Home", full_name: "", phone: "", line1: "", city: "", state: "", pincode: "", is_default: false };

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setSession = useAuthStore((state) => state.setSession);

  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState(emptyAddress);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    if (!token) return;
    api.getMe().then((u) => setSession({ token, user: u })).catch(() => {});
    api.getAddresses().then(setAddresses).catch(() => {});
  }, [token]);

  const saveAddress = async () => {
    setAddrError("");
    try {
      const created = await api.createAddress(newAddr);
      setAddresses((prev) => newAddr.is_default ? [created, ...prev.map((a) => ({ ...a, is_default: false }))] : [...prev, created]);
      setNewAddr(emptyAddress);
      setShowAddForm(false);
    } catch (err) {
      setAddrError(err.message);
    }
  };

  const removeAddress = async (id) => {
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const makeDefault = async (id) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!token || !user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Please login to access your profile.</p>
        <Link href="/auth/login" className="mt-3 inline-block text-sm font-semibold text-brand-700">Login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 pb-24">
      <h1 className="text-2xl font-bold">Profile</h1>

      <section className="card space-y-2">
        <p className="text-sm"><span className="font-semibold">Name:</span> {user.name}</p>
        <p className="text-sm"><span className="font-semibold">Email:</span> {user.email}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Saved Addresses</h2>
          <button type="button" onClick={() => setShowAddForm((v) => !v)} className="text-xs font-semibold text-brand-700">
            {showAddForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showAddForm && (
          <div className="card space-y-2">
            {[["label", "Label (Home/Work)"], ["full_name", "Full name"], ["phone", "Phone"], ["line1", "Address line"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]].map(([field, placeholder]) => (
              <input key={field} className="input" placeholder={placeholder} value={newAddr[field]} onChange={(e) => setNewAddr((p) => ({ ...p, [field]: e.target.value }))} />
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newAddr.is_default} onChange={(e) => setNewAddr((p) => ({ ...p, is_default: e.target.checked }))} />
              Set as default
            </label>
            {addrError ? <p className="text-xs text-rose-600">{addrError}</p> : null}
            <button type="button" onClick={saveAddress} className="btn-primary w-full">Save Address</button>
          </div>
        )}

        {addresses.map((a) => (
          <div key={a.id} className="card space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{a.full_name} — {a.label} {a.is_default ? <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">Default</span> : null}</p>
              <div className="flex gap-2 text-xs">
                {!a.is_default && <button type="button" onClick={() => makeDefault(a.id)} className="text-brand-700">Set default</button>}
                <button type="button" onClick={() => removeAddress(a.id)} className="text-rose-600">Remove</button>
              </div>
            </div>
            <p className="text-xs text-slate-500">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
            <p className="text-xs text-slate-500">{a.phone}</p>
          </div>
        ))}

        {addresses.length === 0 && !showAddForm && <p className="text-sm text-slate-500">No saved addresses.</p>}
      </section>

      <div className="flex gap-2">
        <Link href="/orders" className="btn-secondary">My Orders</Link>
        <button type="button" className="btn-primary" onClick={clearSession}>Logout</button>
      </div>
    </div>
  );
}
