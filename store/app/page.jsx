"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/services/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ limit: 8 })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell space-y-8 py-4 md:py-6">
      <section className="section-surface overflow-hidden rounded-xl border border-border p-6">
        <p className="text-caption uppercase tracking-widest text-text-secondary">Summer Drop 2026</p>
        <h1 className="mt-2 text-page-title">Wear your vibe.</h1>
        <p className="mt-2 max-w-2xl text-body text-text-secondary">
          Oversized fits, sharp graphics, and custom print styles designed to stand out from everyday basics.
        </p>
        <div className="mt-4">
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-section-heading">Trending Products</h2>
          <Link href="/shop" className="btn-ghost min-h-0 px-0 py-0 text-body font-semibold">
            View All
          </Link>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <article key={index} className="card p-0">
                  <div className="skeleton aspect-[3/4] w-full rounded-t-xl" />
                  <div className="space-y-2 p-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-5 w-2/3" />
                  </div>
                </article>
              ))
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="card flex items-center justify-between gap-4">
        <div>
          <h3 className="text-product-name text-primary">Design Your Own T-shirt</h3>
          <p className="mt-1 text-caption text-text-secondary">Upload art, add text, and preview before you checkout.</p>
        </div>
        <Link href="/customize" className="btn-primary shrink-0">
          Start
        </Link>
      </section>
    </div>
  );
}
