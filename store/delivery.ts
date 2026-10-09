import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Delivery pincode the shopper checked in the cart — saved in localStorage so they enter it once.
type DeliveryState = {
  pincode: string | null;
  setPincode: (pincode: string | null) => void;
};

export const useDelivery = create<DeliveryState>()(
  persist(
    (set) => ({
      pincode: null,
      setPincode: (pincode) => set({ pincode }),
    }),
    {
      name: "neythra-pincode",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
