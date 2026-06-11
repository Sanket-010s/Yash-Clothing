"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const desktopNav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/wishlist", label: "Wishlist" }
];

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const previousCount = useRef(cartCount);
  const [badgeAnimated, setBadgeAnimated] = useState(false);

  useEffect(() => {
    if (cartCount > previousCount.current) {
      setBadgeAnimated(true);
      const timer = setTimeout(() => setBadgeAnimated(false), 260);
      previousCount.current = cartCount;
      return () => clearTimeout(timer);
    }

    previousCount.current = cartCount;
    return undefined;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/80 bg-primary text-white">
      <div className="page-shell flex h-14 items-center justify-between lg:h-16">
        <Link href="/" className="text-product-name font-bold tracking-tight">
          Yash Collection
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {desktopNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-body transition ${active ? "font-semibold text-white" : "text-white/75 hover:text-white"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            aria-label="Search products"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-4.2-4.2" />
            </svg>
          </Link>

          <Link
            href="/cart"
            aria-label="Open cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.5L21 7H7.1" />
              <circle cx="10" cy="19" r="1.3" fill="currentColor" />
              <circle cx="17" cy="19" r="1.3" fill="currentColor" />
            </svg>
            {cartCount > 0 ? (
              <span
                className={`absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-primary ${badgeAnimated ? "badge-bounce" : ""}`}
              >
                {cartCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-3 text-sm font-semibold text-primary"
            >
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/auth/login" className="btn-secondary border-white bg-white px-4 text-primary hover:bg-white/90">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
