import { create } from "zustand";

// Cart drawer open / close — UI state mathram, localStorage-il save cheyyunnilla
type CartUiState = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartUi = create<CartUiState>()((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
}));
