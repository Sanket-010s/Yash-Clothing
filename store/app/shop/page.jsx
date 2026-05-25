"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/services/api";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      api
        .getProducts({ search, sort })
        .then((data) => {
          setProducts(data);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [search, sort]);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Shop</h1>
      <div className="grid gap-2 md:grid-cols-[1fr_220px]">
        <input
          className="input"
          placeholder="Search t-shirts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading products...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!loading && products.length === 0 ? <p className="text-sm text-slate-500">No products found.</p> : null}
    </div>
  );
}
