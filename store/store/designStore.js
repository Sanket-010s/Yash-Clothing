import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDesignStore = create(
  persist(
    (set) => ({
      shirtColor: "#ffffff",
      text: "",
      setShirtColor: (shirtColor) => set({ shirtColor }),
      setText: (text) => set({ text })
    }),
    {
      name: "tshirt-design"
    }
  )
);
