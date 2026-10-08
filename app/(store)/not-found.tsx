import NotFoundContent from "@/components/layout/NotFoundContent";

// notFound() inside store pages (e.g. unknown product slug) — the store layout already renders header/footer,
// so only the content goes here (unlike the root not-found)
export default function StoreNotFound() {
  return <NotFoundContent />;
}
