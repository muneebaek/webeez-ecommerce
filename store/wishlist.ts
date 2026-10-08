import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  ids: string[]; // product id-kal mathram — details lib/products-il ninnu edukkum
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [...state.ids, id],
        })),
      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "neythra-wishlist",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
