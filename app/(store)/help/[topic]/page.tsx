import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { getHelpTopic, helpTopics, type HelpBlock } from "@/lib/help";

// All help topics are known up front → every page is prerendered at build time
export function generateStaticParams() {
  return helpTopics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/help/[topic]">): Promise<Metadata> {
  const topic = getHelpTopic((await params).topic);
  return topic ? { title: `${topic.title} — Neythra`, description: topic.intro } : { title: "Not found — Neythra" };
}

// await params inside Suspense so an unknown topic still gets a prerendered shell (Cache Components rule)
export default function HelpPage({ params }: PageProps<"/help/[topic]">) {
  return (
    <div className="bg-ivory">
      <div className="page-shell py-12 lg:py-16">
        <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
          <HelpContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function HelpContent({ params }: Pick<PageProps<"/help/[topic]">, "params">) {
  const { topic: slug } = await params;
  const topic = getHelpTopic(slug);
  if (!topic) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Help", href: "/help/shipping" }, { label: topic.title }]} />
      <header className="mb-10 mt-6 border-b-2 border-rule pb-6 lg:mb-12">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.25em] text-rose">[ Help ]</p>
        <h1 className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none text-ink">{topic.title}.</h1>
        <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-taupe-dark">{topic.intro}</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        {/* topic menu — sideways scroll on mobile, a column on desktop */}
        <nav aria-label="Help topics" className="help-nav">
          {helpTopics.map((t) => (
            <Link key={t.slug} href={`/help/${t.slug}`} aria-current={t.slug === topic.slug ? "page" : undefined} className="help-nav__link">
              {t.title}
            </Link>
          ))}
          <Link href="/orders" className="help-nav__link">
            Track an Order
          </Link>
        </nav>

        <article className="help-article">
          {topic.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}

function Block({ block }: { block: HelpBlock }) {
  if (block.type === "p") return <p>{block.text}</p>;
  if (block.type === "list")
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  return (
    <div className="help-table">
      <table>
        <caption>{block.caption}</caption>
        <thead>
          <tr>
            {block.head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
