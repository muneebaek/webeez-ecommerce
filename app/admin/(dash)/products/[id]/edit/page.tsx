import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProduct, getProductImageOptions } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Edit product" };

// Shell renders instantly; the session check, params and DB read stream in via Suspense (Cache Components rule).
export default function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/admin/products/[id]/edit">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const [product, imageOptions] = await Promise.all([getAdminProduct(id), getProductImageOptions()]);
  if (!product) notFound();

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="grid gap-3">
        <Link href={`/admin/products/${product.id}`} className="adm-link w-fit">
          ← Back to product
        </Link>
        <h1 className="adm-hello">Edit {product.name}</h1>
        <p className="adm-muted">Changes show on the store as soon as you save.</p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ProductForm
          id={product.id}
          imageOptions={imageOptions}
          initial={{
            name: product.name,
            code: product.code,
            category: product.category,
            subtitle: product.subtitle,
            fabric: product.fabric,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            sizes: product.sizes,
            collections: product.collections,
            image: product.images[0] ?? "",
          }}
        />

        {/* current photo for reference — sticky on desktop, hidden on phones (the picker shows it) */}
        <section className="adm-panel hidden xl:sticky xl:top-5 xl:grid">
          <p className="adm-info__label mb-3">Current photo</p>
          <div className="adm-product__image">
            {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="320px" className="object-cover object-top" />}
          </div>
        </section>
      </div>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="grid gap-5 lg:gap-6" aria-busy="true">
      <div className="adm-skeleton h-20 w-72" />
      <div className="adm-skeleton h-96" />
    </div>
  );
}
