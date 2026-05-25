"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getOrders()
      .then((data) => {
        setOrders(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-2 text-sm text-slate-500">
          Login to view order history and invoices.
        </p>
        <Link href="/auth/login" className="mt-3 inline-block text-sm font-semibold text-brand-700">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {loading ? <p className="text-sm text-slate-500">Loading orders...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Order #{order.id}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs">{order.status}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Payment: {order.payment_status}</p>
            <p className="mt-1 text-sm font-semibold">Rs. {order.total_amount.toFixed(2)}</p>
          </article>
        ))}
      </div>

      {!loading && orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : null}
    </div>
  );
}
