import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Orders placed (or opened from the email link) in this browser. There are no customer accounts, so this is how the
// product page knows which pieces this customer bought — only those show "Write a review".
// The token is the order's secret from the confirmation link; the server checks it again before saving a review.
export type RememberedOrder = { orderNumber: string; token: string; productIds: string[] };

type OrdersState = {
  orders: RememberedOrder[];
  remember: (order: RememberedOrder) => void;
};

const MAX_ORDERS = 20;

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      // newest first; the same order again replaces its old entry
      remember: (order) =>
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.orderNumber !== order.orderNumber)].slice(0, MAX_ORDERS),
        })),
    }),
    {
      name: "neythra-orders", // localStorage key
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
