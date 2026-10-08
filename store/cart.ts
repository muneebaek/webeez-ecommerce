import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MAX_QTY } from "@/lib/pricing";

// pricing rules lib/pricing.ts-il (server-um use cheyyunnu) — ivide ninnu re-export
export { FREE_SHIPPING_MIN, MAX_QTY, SHIPPING_FEE, shippingFor } from "@/lib/pricing";

export type CartItem = {
  key: string; // productId + size — same product, vere size = vere line
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number; // display-inu mathram; checkout-il server DB-il ninnu price veendum edukkum
  qty: number;
};

type NewItem = Omit<CartItem, "key" | "qty">;

type CartState = {
  items: CartItem[];
  add: (item: NewItem, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const makeKey = (productId: string, size: string) => `${productId}__${size}`;
const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n)));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      // already undenkil qty koottum, illenkil puthiya line
      add: (item, qty = 1) =>
        set((state) => {
          const key = makeKey(item.productId, item.size);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: clampQty(i.qty + qty) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, key, qty: clampQty(qty) }] };
        }),

      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, qty: clampQty(qty) } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "neythra-cart", // localStorage key
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

// ---------- Derived values (store-il save cheyyunnilla — items-il ninnu calculate) ----------
export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.qty, 0);
