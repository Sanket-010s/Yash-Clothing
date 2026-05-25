"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StickyBar from "@/components/StickyBar";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";

const sizes = ["S", "M", "L", "XL"];
const colors = ["Black", "White", "Red", "Blue"];

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProduct(params.id)
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [params.id]);

  const addToCart = () => {
    if (!product) return;
    addItem(product, { size, color });
    alert("Added to cart");
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  if (error) {
    return <div className="p-4 text-sm text-rose-600">{error}</div>;
  }

  if (!product) {
    return <div className="p-4 text-sm text-slate-500">Loading product...</div>;
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="relative h-[360px] overflow-hidden rounded-xl bg-slate-100">
        <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
      </div>

      <h1 className="text-2xl font-bold">{product.name}</h1>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">Rs. {product.price}</span>
        <span className="text-sm text-slate-400 line-through">Rs. {product.mrp}</span>
      </div>
      <p className="text-sm text-slate-600">{product.description}</p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Size</h2>
        <div className="flex flex-wrap gap-2">
          {sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`rounded-lg border px-3 py-2 text-sm ${size === option ? "border-brand-500 bg-brand-50" : "border-slate-300"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Color</h2>
        <div className="flex flex-wrap gap-2">
          {colors.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              className={`rounded-lg border px-3 py-2 text-sm ${color === option ? "border-brand-500 bg-brand-50" : "border-slate-300"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <StickyBar onAddToCart={addToCart} onBuyNow={buyNow} />
    </div>
  );
}
