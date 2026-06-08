import { create } from "zustand";
import { persist } from "zustand/middleware";

const safeStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.warn("LocalStorage quota exceeded for tshirt-cart; skipping persistence.", err);
        return;
      }
      throw err;
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  }
};

function calculateSummary(items, discount = 0) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 75;
  const safeDiscount = Math.min(discount, subtotal);
  const total = Number(Math.max(0, subtotal + delivery - safeDiscount).toFixed(2));
  return { subtotal, delivery, discount: safeDiscount, total };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (product, selected = { size: "M", color: "Black", variant_id: null }) => {
        const items = [...get().items];
        const existing = items.find(
          (item) =>
            item.id === product.id &&
            item.size === selected.size &&
            item.color === selected.color &&
            item.variant_id === selected.variant_id
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({
            id: product.id,
            variant_id: selected.variant_id,
            name: product.name,
            image_url: product.images?.[0] || "",
            price: product.sale_price || product.base_price || 0,
            mrp: product.base_price || 0,
            quantity: 1,
            size: selected.size,
            color: selected.color
          });
        }
        set({ items });
      },
      increment: (id, size, color, variant_id) => {
        const items = get().items.map((item) =>
          item.id === id && item.size === size && item.color === color && item.variant_id === variant_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        set({ items });
      },
      decrement: (id, size, color, variant_id) => {
        const items = get()
          .items.map((item) =>
            item.id === id && item.size === size && item.color === color && item.variant_id === variant_id
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          )
          .filter((item) => item.quantity > 0);
        set({ items });
      },
      removeItem: (id, size, color, variant_id) => {
        const items = get().items.filter(
          (item) => !(item.id === id && item.size === size && item.color === color && item.variant_id === variant_id)
        );
        set({ items });
      },
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),
      getSummary: () => calculateSummary(get().items, get().coupon?.amount || 0)
    }),
    {
      name: "tshirt-cart",
      storage: safeStorage,
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon
      })
    }
  )
);
