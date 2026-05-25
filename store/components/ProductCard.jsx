"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductCard({ product }) {
  const { showToast } = useToast();
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const [imageReady, setImageReady] = useState(false);

  const discount = product.mrp > 0 ? Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100)) : 0;
  const soldOut = product.stock <= 0;

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const saved = toggleItem(product);
    showToast(saved ? "Added to wishlist" : "Removed from wishlist", "success");
  };

  return (
    <Link href={`/product/${product.id}`} className="card block overflow-hidden p-0 transition hover:-translate-y-0.5">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {discount > 0 ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
            {discount}% OFF
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-primary"
        >
          <HeartIcon filled={isSaved} />
        </button>

        {soldOut ? (
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">
            Sold Out
          </span>
        ) : null}

        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className={`object-cover transition duration-300 ${imageReady ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
          onLoad={() => setImageReady(true)}
        />
        {!imageReady ? <div className="absolute inset-0 bg-surface" aria-hidden /> : null}
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2-custom text-product-name leading-snug text-text-primary">{product.name}</h3>
        <p className="text-caption text-text-secondary">{product.category}</p>
        <div className="flex items-center gap-2">
          <span className="text-price leading-none">Rs. {product.price}</span>
          <span className="text-caption text-muted line-through">Rs. {product.mrp}</span>
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor">
        <path d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
    </svg>
  );
}
