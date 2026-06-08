"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const initialAddress = { full_name: "", phone: "", line1: "", city: "", state: "", pincode: "" };

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => state.getSummary());
  const clearCart = useCartStore((state) => state.clearCart);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api.getAddresses().then((list) => {
      setSavedAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) setSelectedAddressId(def.id);
    }).catch(() => {});
  }, [token]);

  const updateField = (field, value) => setAddress((prev) => ({ ...prev, [field]: value }));

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const orderPayload = {
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          design_id: item.design_id || null
        })),
        ...(selectedAddressId
          ? { address_id: selectedAddressId }
          : { address })
      };

      const order = await api.createOrder(orderPayload);
      const paymentOrder = await api.createPaymentOrder({ order_id: order.id });

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const loaded = await loadRazorpay();

      if (!loaded || !razorpayKeyId || paymentOrder.razorpay_order_id.startsWith("test_order_")) {
        // dev stub fallback
        await api.verifyPayment({
          order_id: order.id,
          razorpay_order_id: paymentOrder.razorpay_order_id,
          razorpay_payment_id: `test_pay_${Date.now()}`,
          razorpay_signature: "dev_signature",
          method: "test"
        });
        clearCart();
        setMessage(`Order confirmed! Order ID: #${order.id}`);
        return;
      }

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: razorpayKeyId,
          amount: paymentOrder.amount,
          currency: "INR",
          order_id: paymentOrder.razorpay_order_id,
          name: "Yash Collection",
          description: "T-Shirt Order",
          prefill: {
            name: user?.name || "",
            email: user?.email || ""
          },
          handler: async (response) => {
            try {
              await api.verifyPayment({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                method: null
              });
              clearCart();
              setMessage(`Order confirmed! Order ID: #${order.id}`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) }
        });
        rzp.open();
      });
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

        {savedAddresses.length > 0 && (
          <div className="space-y-2">
            {savedAddresses.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                <input
                  type="radio"
                  name="saved_address"
                  className="mt-0.5"
                  checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)}
                />
                <div className="text-sm">
                  <p className="font-semibold">{a.full_name} — {a.label}</p>
                  <p className="text-slate-500">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
                  <p className="text-slate-500">{a.phone}</p>
                </div>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
              <input
                type="radio"
                name="saved_address"
                checked={selectedAddressId === null}
                onChange={() => setSelectedAddressId(null)}
              />
              <span className="text-sm font-semibold">Use a new address</span>
            </label>
          </div>
        )}

        {(!savedAddresses.length || selectedAddressId === null) && (
          <div className="space-y-3">
            <input className="input" placeholder="Full name" value={address.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
            <input className="input" placeholder="Phone" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input className="input" placeholder="Address line" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
              <input className="input" placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
            </div>
            <input className="input" placeholder="Pincode" value={address.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
          </div>
        )}
      </section>

      <section className="card space-y-2 text-sm">
        <h2 className="text-sm font-semibold">Bill Summary</h2>
        <div className="flex justify-between"><span>Subtotal</span><span>Rs. {summary.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>Rs. {summary.delivery.toFixed(2)}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
          <span>Total</span><span>Rs. {summary.total.toFixed(2)}</span>
        </div>
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <button type="button" className="btn-primary w-full" onClick={placeOrder} disabled={busy}>
        {busy ? "Processing..." : "Pay and Place Order"}
      </button>
    </div>
  );
}
