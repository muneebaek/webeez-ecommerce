import { Suspense } from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";
import NotFoundContent from "@/components/layout/NotFoundContent";

// Root 404 — undakkaatha URLs (ex: /checkout ippo) store layout-inte purathu aanu,
// athukondu header/footer/tab bar ivide thanne. Store-inte ullile notFound() → app/(store)/not-found.tsx
export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <NotFoundContent />
      </main>
      <Footer />
      {/* usePathname (active tab) — dynamic URL-il Suspense venam (Cache Components rule) */}
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
      <CartDrawer />
    </>
  );
}
