"use client";

import Image from "next/image";

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <article className="flex gap-3 py-3">
      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-surface">
        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="text-body font-semibold text-text-primary">{item.name}</h3>
        <p className="text-caption text-text-secondary">
          {item.size} / {item.color}
        </p>
        <p className="text-price text-[1.05rem]">Rs. {item.price}</p>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-base font-semibold text-primary" onClick={onDecrement}>
            -
          </button>
          <span className="w-6 text-center text-body">{item.quantity}</span>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-base font-semibold text-primary" onClick={onIncrement}>
            +
          </button>
          <button type="button" className="ml-auto text-caption font-medium text-danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
