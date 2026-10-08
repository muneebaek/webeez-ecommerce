import { Suspense } from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";
import NotFoundContent from "@/components/layout/NotFoundContent";

// Root 404 — unknown URLs fall outside the store layout,
// so header/footer/tab bar are rendered here. notFound() inside the store → app/(store)/not-found.tsx
export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <NotFoundContent />
      </main>
      <Footer />
      {/* usePathname (active tab) reads the dynamic URL, so it needs Suspense (Cache Components rule) */}
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
      <CartDrawer />
    </>
  );
}
