"use client";

export default function StickyBar({ onAddToCart, onBuyNow }) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 h-[72px] border-t border-border bg-background px-4 py-3 lg:bottom-0 lg:px-8">
      <div className="mx-auto flex h-full max-w-container gap-2">
        <button type="button" className="btn-secondary h-12 w-1/2" onClick={onAddToCart}>
          Add to Cart
        </button>
        <button type="button" className="btn-primary h-12 w-1/2" onClick={onBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
