import { create } from "zustand";
import { persist } from "zustand/middleware";

function buildAddress(payload) {
  const id = payload.id || `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  return {
    id,
    full_name: payload.full_name || "",
    phone: payload.phone || "",
    line1: payload.line1 || "",
    line2: payload.line2 || "",
    city: payload.city || "",
    state: payload.state || "",
    pincode: payload.pincode || "",
    email: payload.email || "",
    is_default: Boolean(payload.is_default)
  };
}

export const useCheckoutStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      guestContact: {
        email: "",
        phone: ""
      },
      confirmation: null,
      selectAddress: (id) => set({ selectedAddressId: id }),
      addAddress: (addressPayload) => {
        const addresses = [...get().addresses];
        const address = buildAddress({
          ...addressPayload,
          is_default: addresses.length === 0 || addressPayload.is_default
        });
        const normalized = address.is_default
          ? addresses.map((item) => ({ ...item, is_default: false }))
          : addresses;

        set({
          addresses: [...normalized, address],
          selectedAddressId: address.id
        });
      },
      updateAddress: (id, patch) => {
        const addresses = get().addresses.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        );

        set({ addresses });
      },
      setDefaultAddress: (id) => {
        const addresses = get().addresses.map((item) => ({
          ...item,
          is_default: item.id === id
        }));
        set({ addresses, selectedAddressId: id });
      },
      removeAddress: (id) => {
        const addresses = get().addresses.filter((item) => item.id !== id);
        const defaultAddress = addresses.find((item) => item.is_default) || addresses[0] || null;

        const normalized = addresses.map((item) => ({
          ...item,
          is_default: defaultAddress ? item.id === defaultAddress.id : false
        }));

        set({
          addresses: normalized,
          selectedAddressId: defaultAddress ? defaultAddress.id : null
        });
      },
      setGuestContact: (guestContact) => set({ guestContact: { ...guestContact } }),
      setConfirmation: (confirmation) => set({ confirmation }),
      clearConfirmation: () => set({ confirmation: null })
    }),
    {
      name: "tshirt-checkout"
    }
  )
);

