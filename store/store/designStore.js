import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDesignStore = create(
  persist(
    (set) => ({
      shirtColor: "#ffffff",
      text: "",
      uploadedImage: null,
      textColor: "#1A1A1A",
      textAlign: "center",
      imageAlign: "center",
      imageScale: 100,
      setShirtColor: (shirtColor) => set({ shirtColor }),
      setText: (text) => set({ text }),
      setUploadedImage: (uploadedImage) => set({ uploadedImage }),
      setTextColor: (textColor) => set({ textColor }),
      setTextAlign: (textAlign) => set({ textAlign }),
      setImageAlign: (imageAlign) => set({ imageAlign }),
      setImageScale: (imageScale) => set({ imageScale })
    }),
    {
      name: "tshirt-design"
    }
  )
);
