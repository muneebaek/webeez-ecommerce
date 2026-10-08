import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign in — Neythra",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <main className="adm grid min-h-screen place-items-center px-4 py-12">
      <div className="adm-card w-full max-w-sm p-8">
        <p className="text-center font-serif text-[1.6rem] font-semibold tracking-[0.32em] text-ink">NEYTHRA</p>
        <div className="mt-6 text-center">
          <p className="adm-kicker">[ Admin ]</p>
          <h1 className="adm-title mt-2">Sign In</h1>
          <p className="adm-muted mt-2 text-[0.8125rem]">Manage orders and products.</p>
        </div>
        <LoginForm />
        <Link href="/" className="adm-link mt-6 block text-center">
          ← Back to store
        </Link>
      </div>
    </main>
  );
}
