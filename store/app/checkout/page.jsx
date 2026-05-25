"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";

const initialAddress = {
  full_name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: ""
};

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => state.getSummary());
  const clearCart = useCartStore((state) => state.clearCart);
  const [address, setAddress] = useState(initialAddress);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        address
      };

      const order = await api.createOrder(orderPayload);
      const paymentOrder = await api.createPaymentOrder({ order_id: order.id });
      await api.verifyPayment({
        order_id: order.id,
        payment_id: `test_payment_${paymentOrder.order_id}`,
        signature: "dev_signature"
      });

      clearCart();
      setMessage(`Order confirmed. Your order ID is #${order.id}.`);
      setAddress(initialAddress);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-slate-500">Add products to cart before checkout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold">Delivery Address</h2>
        <input className="input" placeholder="Full name" value={address.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
        <input className="input" placeholder="Phone" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
        <input className="input" placeholder="Address line" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
          <input className="input" placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
        </div>
        <input className="input" placeholder="Pincode" value={address.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
      </section>

      <section className="card space-y-2 text-sm">
        <h2 className="text-sm font-semibold">Bill Summary</h2>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {summary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>Rs. {summary.gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>Rs. {summary.delivery.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
          <span>Total</span>
          <span>Rs. {summary.total.toFixed(2)}</span>
        </div>
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <button type="button" className="btn-primary w-full" onClick={placeOrder} disabled={busy}>
        {busy ? "Processing..." : "Pay and Place Order"}
      </button>
      <p className="text-xs text-slate-500">
        Razorpay popup integration is replaced with a dev stub for now.
      </p>
    </div>
  );
}
