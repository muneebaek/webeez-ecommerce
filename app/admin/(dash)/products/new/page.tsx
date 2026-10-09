import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth/admin";
import { getProductImageOptions } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Add product" };

// Same form as editing, starting empty. The session check + photo list stream in via Suspense (Cache Components rule).
export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="adm-skeleton h-96" aria-busy="true" />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdmin();
  const imageOptions = await getProductImageOptions();

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="grid gap-3">
        <Link href="/admin/products" className="adm-link w-fit">
          ← Products
        </Link>
        <h1 className="adm-hello">Add product</h1>
        <p className="adm-muted">Fill in the details and pick or upload a photo. It shows on the store as soon as you create it.</p>
      </header>

      <div className="xl:max-w-[calc(100%-21rem)]">
        <ProductForm
          submitLabel="Create product"
          imageOptions={imageOptions}
          initial={{
            name: "",
            code: "",
            category: "",
            subtitle: "",
            fabric: "",
            description: "",
            price: "",
            stock: "",
            sizes: [],
            collections: [],
            image: "",
          }}
        />
      </div>
    </div>
  );
}
