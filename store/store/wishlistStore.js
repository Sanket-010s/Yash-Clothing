import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const current = get().items;
        const exists = current.some((item) => item.id === product.id);
        if (exists) {
          set({ items: current.filter((item) => item.id !== product.id) });
          return false;
        }

        set({
          items: [
            ...current,
            {
              id: product.id,
              name: product.name,
              image_url: product.image_url,
              price: product.price,
              mrp: product.mrp,
              stock: product.stock
            }
          ]
        });
        return true;
      },
      isSaved: (id) => get().items.some((item) => item.id === id)
    }),
    {
      name: "tshirt-wishlist"
    }
  )
);

