"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/shop", label: "Shop", icon: ShopIcon },
  { href: "/customize", label: "Customize", icon: CustomizeIcon },
  { href: "/wishlist", label: "Wishlist", icon: HeartIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-surface shadow-nav lg:hidden">
      <div className="mx-auto grid h-full max-w-container grid-cols-5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full flex-col items-center justify-center gap-1 px-1 ${active ? "text-accent" : "text-muted"}`}
            >
              <Icon active={active} />
              <span className={`text-nav ${active ? "font-semibold text-accent" : "text-muted"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 3 3 10v10h6v-6h6v6h6V10z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10 12 3l9 7" />
      <path d="M5 9.8V20h5v-6h4v6h5V9.8" />
    </svg>
  );
}

function ShopIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M6 3h12l1.5 5.6A3 3 0 0 1 16.6 12H7.4a3 3 0 0 1-2.9-3.4z" />
        <path d="M6 13h12v8H6z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12l1.5 5.6A3 3 0 0 1 16.6 12H7.4a3 3 0 0 1-2.9-3.4z" />
      <path d="M6 12.8V21h12v-8.2" />
    </svg>
  );
}

function CustomizeIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  );
}

function HeartIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 1 1 16 0z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 1 1 16 0" />
    </svg>
  );
}
