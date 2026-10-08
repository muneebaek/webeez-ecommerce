import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // share images (Open Graph) full URL aakaan — Vercel-il NEXT_PUBLIC_SITE_URL set cheyyum
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Neythra — Contemporary Indian Fashion",
  description:
    "Contemporary clothing shaped by Indian texture and architectural drape.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
