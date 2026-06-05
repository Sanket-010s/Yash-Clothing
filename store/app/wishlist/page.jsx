"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import EmptyState from "@/components/EmptyState";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.toggleItem);

  if (items.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <EmptyState
          title="Your wishlist is empty"
          description="Add items to your wishlist to save them for later."
          action={
            <Link href="/shop" className="btn-primary">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card flex gap-4 p-3">
            <Link href={`/product/${item.id}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={item.images?.[0] || item.image_url || "https://placehold.co/100x150"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${item.id}`} className="line-clamp-2 font-semibold text-text-primary hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-caption text-text-secondary">{item.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-price font-semibold">Rs. {item.sale_price || item.price || item.base_price}</span>
                  {item.sale_price && item.base_price > item.sale_price && (
                    <span className="text-caption text-muted line-through">Rs. {item.base_price || item.mrp}</span>
                  )}
                </div>

                <button
                  onClick={() => removeItem(item)}
                  className="text-caption font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Link href="/shop" className="btn-primary block text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
