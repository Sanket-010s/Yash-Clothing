import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      syncFromServer: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        try {
          const data = await api.getWishlist();
          set({
            items: data.map((entry) => ({
              id: entry.product.id,
              name: entry.product.name,
              category: entry.product.category,
              images: entry.product.images,
              base_price: entry.product.base_price,
              sale_price: entry.product.sale_price,
              variants: entry.product.variants
            }))
          });
        } catch {}
      },

      toggleItem: async (product) => {
        const token = useAuthStore.getState().token;
        const current = get().items;
        const exists = current.some((item) => item.id === product.id);

        if (exists) {
          set({ items: current.filter((item) => item.id !== product.id) });
          if (token) api.removeFromWishlist(product.id).catch(() => {});
          return false;
        }

        set({
          items: [
            ...current,
            {
              id: product.id,
              name: product.name,
              category: product.category,
              images: product.images,
              base_price: product.base_price,
              sale_price: product.sale_price,
              variants: product.variants
            }
          ]
        });
        if (token) api.addToWishlist(product.id).catch(() => {});
        return true;
      },

      isSaved: (id) => get().items.some((item) => item.id === id)
    }),
    { name: "tshirt-wishlist" }
  )
);
