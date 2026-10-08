import { useSyncExternalStore } from "react";

// false on the server, true in the browser.
// Cart / wishlist live in localStorage, which the server doesn't have. Counts are shown only after hydration,
// otherwise the server HTML and browser HTML would differ (hydration mismatch error).
const subscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
