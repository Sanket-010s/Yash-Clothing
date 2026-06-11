"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/services/api";

const PAGE_SIZE = 20;

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Reset and fetch first page whenever search/sort changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setProducts([]);
      setPage(1);
      setHasMore(true);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, sort]);

  // Fetch whenever page changes (or after reset)
  useEffect(() => {
    if (!hasMore && page !== 1) return;
    setLoading(true);
    api
      .getProducts({ search, sort, page, limit: PAGE_SIZE })
      .then((data) => {
        setProducts((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort]);

  // Intersection observer to load next page
  const handleObserver = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Shop</h1>
      <div className="grid gap-2 md:grid-cols-[1fr_220px]">
        <input
          className="input"
          placeholder="Search t-shirts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
        </select>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <article key={i} className="card p-0">
                <div className="skeleton aspect-[3/4] w-full rounded-t-xl" />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-5 w-2/3" />
                </div>
              </article>
            ))
          : null}
      </div>

      {!loading && products.length === 0 ? (
        <p className="text-sm text-slate-500">No products found.</p>
      ) : null}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
