import { Suspense } from "react";
import CartDrawer from "@/components/cart/CartDrawer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      {/* usePathname (active tab) reads the dynamic URL, so it needs Suspense (Cache Components rule) */}
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
      <CartDrawer />
    </>
  );
}
