import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isGuest: false,
      setSession: ({ token, user }) => set({ token, user, isGuest: false }),
      startGuestSession: () => set({ token: null, user: null, isGuest: true }),
      clearSession: () => set({ token: null, user: null, isGuest: false })
    }),
    {
      name: "tshirt-auth"
    }
  )
);
