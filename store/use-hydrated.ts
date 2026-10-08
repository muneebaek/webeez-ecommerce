import { useSyncExternalStore } from "react";

// Server-il false, browser-il true.
// Cart / wishlist localStorage-il aanu — server-il athu illa. Counts hydration kazhinjittu mathram
// kaanikkunnu, illenkil server HTML-um browser HTML-um vere aakum (hydration mismatch error).
const subscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
