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
  const [invoiceLoading, setInvoiceLoading] = useState({});

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const downloadInvoice = async (orderId) => {
    setInvoiceLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const invoice = await api.getInvoice(orderId);
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, "_blank", "noopener");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setInvoiceLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (!token) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-2 text-sm text-slate-500">Login to view order history and invoices.</p>
        <Link href="/auth/login" className="mt-3 inline-block text-sm font-semibold text-brand-700">Go to login</Link>
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
          <article key={order.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs">{order.status}</span>
            </div>
            <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            <div className="space-y-1 text-xs text-slate-600">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} — {item.size}/{item.color} × {item.quantity}</span>
                  <span>Rs. {(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <p className="text-sm font-semibold">Rs. {Number(order.total_amount).toFixed(2)}</p>
              {order.status === "confirmed" || order.status === "shipped" || order.status === "delivered" ? (
                <button
                  type="button"
                  onClick={() => downloadInvoice(order.id)}
                  disabled={invoiceLoading[order.id]}
                  className="text-xs font-semibold text-brand-700 hover:underline disabled:opacity-50"
                >
                  {invoiceLoading[order.id] ? "Loading..." : "Download Invoice"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : null}
    </div>
  );
}
