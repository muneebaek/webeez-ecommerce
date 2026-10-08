import Image from "next/image";
import Link from "next/link";

// Community photos — instagram post pole
const posts = [
  { src: "/images/community/seen-01.jpg", alt: "Woman in a red embroidered dupatta" },
  { src: "/images/community/seen-06.jpg", alt: "Man in a plum shirt and denim" },
  { src: "/images/community/seen-02.jpg", alt: "Woman in a white knit top holding flowers" },
  { src: "/images/community/seen-03.jpg", alt: "Woman in an orange plaid overshirt" },
  { src: "/images/community/seen-04.jpg", alt: "Smiling woman in a red headscarf" },
  { src: "/images/community/seen-05.jpg", alt: "Woman in a red kurta with palazzo" },
];

const INSTAGRAM = "https://instagram.com/neythra";

export default function SeenInTheWild() {
  return (
    <section className="bg-ivory py-14 lg:py-20">
      <div className="page-shell">
        {/* ---------- Heading row ---------- */}
        <header className="flex flex-col gap-6 border-b-2 border-rule pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.25em] text-rose lg:text-[0.625rem]">
              [ Public Archive ]
            </p>
            <h2 className="mt-3 text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.01em] uppercase text-ink">
              @Neythra — Seen in the Wild
            </h2>
          </div>
          <Link
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 self-start bg-[linear-gradient(currentColor,currentColor)] bg-size-[100%_1.5px] bg-bottom bg-no-repeat pb-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ink lg:self-auto lg:text-[0.625rem]"
          >
            Follow the Community
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </header>

        {/* ---------- 6 tiles: mobile 3 col, desktop 6 col ---------- */}
        <ul className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-12 lg:grid-cols-6 lg:gap-4">
          {posts.map((post) => (
            <li key={post.src}>
              <Link
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[182/284] overflow-hidden border-2 border-[#c4c0b8]"
                aria-label={`${post.alt} — view on Instagram`}
              >
                <Image
                  src={post.src}
                  alt={post.alt}
                  fill
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover object-[50%_30%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* hover: dark overlay + instagram icon */}
                <span className="absolute inset-0 grid place-items-center bg-slate/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fcfaf5" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="#fcfaf5" stroke="none" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
