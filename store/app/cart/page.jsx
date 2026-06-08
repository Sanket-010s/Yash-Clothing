"use client";

import Link from "next/link";
import CartItem from "@/components/CartItem";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const summary = useCartStore((state) => state.getSummary());

  return (
    <div className="page-shell space-y-6 py-4 md:py-6">
      <h1 className="text-page-title">Cart</h1>

      {items.length === 0 ? (
        <section className="py-10 text-center">
          <p className="text-body text-text-secondary">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-4">
            Browse Products
          </Link>
        </section>
      ) : null}

      <div className="divide-y divide-border">
        {items.map((item) => (
          <CartItem
            key={`${item.id}-${item.size}-${item.color}`}
            item={item}
            onIncrement={() => increment(item.id, item.size, item.color)}
            onDecrement={() => decrement(item.id, item.size, item.color)}
            onRemove={() => removeItem(item.id, item.size, item.color)}
          />
        ))}
      </div>

      <section className="space-y-2 border-t border-border pt-4 text-body">
        <div className="flex justify-between">
          <span>Coupon Discount</span>
          <span>- Rs. {summary.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {summary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>Rs. {summary.delivery.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-[1rem] font-semibold">
          <span>Total</span>
          <span>Rs. {summary.total.toFixed(2)}</span>
        </div>
      </section>

      {items.length > 0 ? (
        <Link href="/checkout" className="btn-primary block text-center">
          Proceed to Checkout
        </Link>
      ) : null}
    </div>
  );
}
