import { create } from "zustand";
import { persist } from "zustand/middleware";

function calculateSummary(items, discount = 0) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Number((subtotal * 0.12).toFixed(2));
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const safeDiscount = Math.min(discount, subtotal);
  const total = Number(Math.max(0, subtotal + gst + delivery - safeDiscount).toFixed(2));
  return { subtotal, gst, delivery, discount: safeDiscount, total };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (product, selected = { size: "M", color: "Black" }) => {
        const items = [...get().items];
        const existing = items.find(
          (item) =>
            item.id === product.id &&
            item.size === selected.size &&
            item.color === selected.color
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({
            id: product.id,
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
      increment: (id, size, color) => {
        const items = get().items.map((item) =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        set({ items });
      },
      decrement: (id, size, color) => {
        const items = get()
          .items.map((item) =>
            item.id === id && item.size === size && item.color === color
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          )
          .filter((item) => item.quantity > 0);
        set({ items });
      },
      removeItem: (id, size, color) => {
        const items = get().items.filter(
          (item) => !(item.id === id && item.size === size && item.color === color)
        );
        set({ items });
      },
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),
      getSummary: () => calculateSummary(get().items, get().coupon?.amount || 0)
    }),
    {
      name: "tshirt-cart"
    }
  )
);
