// Product data — ippo static. Database (Prisma + Neon) step-il ithe shape-il DB-il ninnu varum,
// appo components maattenda.

export type Category = "women" | "men" | "essentials";

export type Product = {
  id: string;
  slug: string; // URL: /products/[slug]
  code: string; // "NO. 01"
  name: string;
  subtitle: string; // colour / detail line
  fabric: string;
  category: Category;
  collections: string[]; // "current", "trending", "new-arrivals", "under-2999" ...
  price: number; // ₹, whole rupees
  images: string[];
  sizes: string[];
  stock: number;
  badge?: { label: string; tone: "dark" | "rose" | "sage" };
  status?: string; // stock label override — "Restocked" pole; illenkil stock-il ninnu calculate
  statusAccent?: boolean; // status rose colour-il ("Bestseller")
  eyebrow?: string; // card meta override — "Foundation 01" (code + fabric-inu pakaram)
  description: string;
};

export const products: Product[] = [
  {
    id: "p01",
    slug: "sculpted-mineral-tunic",
    code: "NO. 01",
    name: "Sculpted Mineral Tunic",
    subtitle: "Mineral Sage / Tailored Wrap Collar",
    fabric: "Chanderi Silk",
    category: "women",
    collections: ["current"],
    price: 3690,
    images: ["/images/products/sculpted-mineral-tunic.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 20,
    badge: { label: "Edition 04/20", tone: "dark" },
    description:
      "A sculpted tunic in hand-woven Chanderi silk with a tailored wrap collar and fine thread embroidery along the yoke.",
  },
  {
    id: "p02",
    slug: "porcelain-draped-palazzo",
    code: "NO. 02",
    name: "Porcelain Draped Palazzo",
    subtitle: "Natural Ecru / Elasticated Paperbag Waist",
    fabric: "Organic Cotton",
    category: "women",
    collections: ["current"],
    price: 3290,
    images: ["/images/products/porcelain-draped-palazzo.jpg"],
    sizes: ["XS", "S", "M", "L"],
    stock: 6,
    badge: { label: "Low Stock", tone: "rose" },
    description:
      "Fluid wide-leg palazzo in organic cotton voile with an elasticated paperbag waist for unencumbered movement.",
  },
  {
    id: "p03",
    slug: "architectural-khadi-overshirt",
    code: "NO. 03",
    name: "Architectural Khadi Overshirt",
    subtitle: "Chalk Stone / Boxy Silhouette",
    fabric: "Village Weave",
    category: "men",
    collections: ["current"],
    price: 2890,
    images: ["/images/products/architectural-khadi-overshirt.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 18,
    badge: { label: "Atelier Ed.", tone: "dark" },
    description:
      "A boxy overshirt in hand-spun village-weave khadi with twin flap pockets and a relaxed dropped shoulder.",
  },
  {
    id: "p04",
    slug: "oxide-pleated-column-dress",
    code: "NO. 04",
    name: "Oxide Pleated Column Dress",
    subtitle: "Oxide Rose / Knife-Pleat Spine",
    fabric: "Mul Mul Cotton",
    category: "women",
    collections: ["current"],
    price: 4190,
    images: ["/images/products/oxide-pleated-column-dress.jpg"],
    sizes: ["XS", "S", "M", "L"],
    stock: 12,
    badge: { label: "Runway Capsule", tone: "rose" },
    description:
      "A column dress in feather-light mul mul cotton, knife-pleated from yoke to hem with a layered cape overlay.",
  },
];

// ---------- Trending Now ----------
products.push(
  {
    id: "tr01",
    slug: "raw-silk-asymmetric-kaftan",
    code: "TR-01",
    name: "Raw Silk Asymmetric Kaftan",
    subtitle: "Dusk Mauve / Free Silhouette",
    fabric: "Raw Silk",
    category: "women",
    collections: ["trending"],
    price: 4490,
    images: ["/images/products/raw-silk-asymmetric-kaftan.jpg"],
    sizes: ["Free Size"],
    stock: 3,
    badge: { label: "Selling Rapidly", tone: "dark" },
    description:
      "An asymmetric kaftan in lustrous raw silk with hand-embroidered neckline, tassel trims and a self-tie waist.",
  },
  {
    id: "tr02",
    slug: "forest-fluted-top",
    code: "TR-02",
    name: "Forest Fluted Top",
    subtitle: "Forest Green / Origami Tuck",
    fabric: "Modal Linen",
    category: "women",
    collections: ["trending"],
    price: 2490,
    images: ["/images/products/slate-fluted-top.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 15,
    badge: { label: "Core Essential", tone: "sage" },
    status: "Restocked",
    description:
      "A fluted top in crinkled modal linen with a scalloped stand collar, balloon sleeves and a peplum hem.",
  },
  {
    id: "tr03",
    slug: "tailored-pleated-trouser",
    code: "TR-03",
    name: "Tailored Pleated Trouser",
    subtitle: "Sand Beige / Double Knife Pleat",
    fabric: "Cotton Twill",
    category: "essentials",
    collections: ["trending"],
    price: 3190,
    images: ["/images/products/tailored-pleated-trouser.jpg"],
    sizes: ["26", "28", "30", "32", "34", "36"],
    stock: 22,
    badge: { label: "Unisex Fit", tone: "dark" },
    description:
      "High-rise trousers in brushed cotton twill with a double knife pleat, belt loops and a fluid wide leg.",
  },
  {
    id: "tr04",
    slug: "umber-slip-dress",
    code: "TR-04",
    name: "Umber Slip Dress",
    subtitle: "Umber Marble / Bias Cut",
    fabric: "Mulberry Silk",
    category: "women",
    collections: ["trending"],
    price: 3890,
    images: ["/images/products/mineral-slip-dress.jpg"],
    sizes: ["XS", "S", "M", "L"],
    stock: 14,
    badge: { label: "Most Saved", tone: "rose" },
    description:
      "A bias-cut midi slip dress in mulberry silk with fine adjustable straps and a side slit.",
  },
);

// ---------- New Arrivals ----------
products.push(
  {
    id: "int01",
    slug: "architectural-chanderi-overcoat",
    code: "INT-01",
    name: "Architectural Chanderi Overcoat",
    subtitle: "Ivory Ecru / Dropped Lapel / Removable Hand-Spun Sash",
    fabric: "Chanderi Tusser Silk",
    category: "women",
    collections: ["new-arrivals"],
    price: 6890,
    images: ["/images/products/architectural-chanderi-overcoat.jpg"],
    sizes: ["XS", "S", "M", "L"],
    stock: 15,
    badge: { label: "Flagship Silhouette", tone: "rose" },
    status: "Limited Edition of 15",
    description:
      "A sculptural overcoat in Chanderi tusser silk with a dropped lapel, cape-split sleeves and a removable hand-spun sash.",
  },
  {
    id: "int02",
    slug: "mineral-draped-wrap-shirt",
    code: "INT-02",
    name: "Mineral Draped Wrap Shirt",
    subtitle: "Natural Indigo / Hidden Fasteners",
    fabric: "Indigo Twill",
    category: "women",
    collections: ["new-arrivals"],
    price: 3450,
    images: ["/images/products/mineral-draped-wrap-shirt.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 20,
    status: "New",
    description:
      "An oversized draped wrap shirt in micro-pleated indigo with a knotted front and hidden fasteners.",
  },
  {
    id: "int03",
    slug: "structured-bandh-kurta",
    code: "INT-03",
    name: "Structured Bandh Kurta",
    subtitle: "Bone Chalk / Architectural Pocket",
    fabric: "Handloom Cotton",
    category: "men",
    collections: ["new-arrivals"],
    price: 2990,
    images: ["/images/products/structured-bandh-kurta.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 25,
    status: "New",
    description:
      "A band-collar kurta in breathable handloom cotton with a half placket and a structured chest pocket.",
  },
);

// ---------- Everyday, Under ₹2,999 ----------
products.push(
  {
    id: "fd01",
    slug: "ivory-halter-shift-dress",
    code: "FD-01",
    eyebrow: "Foundation 01",
    name: "Ivory Halter Shift Dress",
    subtitle: "100% Organic Linen",
    fabric: "Organic Linen",
    category: "women",
    collections: ["under-2999"],
    price: 1890,
    images: ["/images/products/ivory-halter-shift-dress.jpg"],
    sizes: ["XS", "S", "M", "L"],
    stock: 18,
    status: "Bestseller",
    statusAccent: true,
    description:
      "A relaxed halter-neck shift dress in breathable organic linen with a keyhole back and side slits.",
  },
  {
    id: "fd02",
    slug: "unbleached-lounge-pant",
    code: "FD-02",
    eyebrow: "Foundation 02",
    name: "Unbleached Lounge Pant",
    subtitle: "Slub Cotton Handloom",
    fabric: "Slub Cotton",
    category: "essentials",
    collections: ["under-2999"],
    price: 2490,
    images: ["/images/products/unbleached-lounge-pant.jpg"],
    sizes: ["S", "M", "L", "XL"],
    stock: 24,
    status: "Restocked",
    description:
      "Easy drawstring lounge pants in unbleached slub handloom cotton with curved pockets. Also in umber and ink.",
  },
  {
    id: "fd03",
    slug: "mineral-feather-scarf",
    code: "FD-03",
    eyebrow: "Foundation 03",
    name: "Mineral Feather Scarf",
    subtitle: "Mulmul Cotton Weave",
    fabric: "Mulmul Cotton",
    category: "essentials",
    collections: ["under-2999"],
    price: 1490,
    images: ["/images/products/mineral-feather-scarf.jpg"],
    sizes: ["One Size"],
    stock: 30,
    description:
      "A feather-light layering scarf in hand-dyed mineral blue mulmul with raw, frayed edges.",
  },
  {
    id: "fd04",
    slug: "slate-boxy-kurta",
    code: "FD-04",
    eyebrow: "Foundation 04",
    name: "Slate Boxy Kurta",
    subtitle: "Combed Organic Twill",
    fabric: "Organic Twill",
    category: "men",
    collections: ["under-2999"],
    price: 2890,
    images: ["/images/products/slate-boxy-kurta.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 20,
    description:
      "A short boxy kurta in slate melange organic twill with a notch neckline and side vents.",
  },
);

// ---------- Look 01 (ensemble pieces) ----------
products.push(
  {
    id: "lk01",
    slug: "sculptural-linen-tunic",
    code: "LK-01",
    name: "Sculptural Linen Tunic",
    subtitle: "Raw Ivory / Size 01-04",
    fabric: "Handloom Linen",
    category: "women",
    collections: ["look-01"],
    price: 3490,
    images: ["/images/look/look-01-wide.png"],
    sizes: ["01", "02", "03", "04"],
    stock: 12,
    description:
      "A layered asymmetric tunic in raw ivory handloom linen with an attached shoulder drape and handkerchief hem.",
  },
  {
    id: "lk02",
    slug: "wide-leg-raw-silk-trouser",
    code: "LK-02",
    name: "Wide-Leg Raw Silk Trouser",
    subtitle: "Raw Ivory / Handloom",
    fabric: "Raw Silk",
    category: "women",
    collections: ["look-01"],
    price: 2990,
    images: ["/images/look/look-01-wide.png"],
    sizes: ["XS", "S", "M", "L"],
    stock: 14,
    description: "Fluid wide-leg trousers in handloom raw silk with a flat front and pressed crease.",
  },
  {
    id: "lk03",
    slug: "hand-carved-brass-cuff",
    code: "LK-03",
    name: "Hand-Carved Brass Cuff",
    subtitle: "Solid Brass / Sand Cast",
    fabric: "Solid Brass",
    category: "essentials",
    collections: ["look-01"],
    price: 1490,
    images: ["/images/look/look-01-wide.png"],
    sizes: ["One Size"],
    stock: 25,
    description: "A stack of hand-carved sand-cast brass bangles, finished by artisans in Moradabad.",
  },
);

export function getProductsByCollection(collection: string) {
  return products.filter((p) => p.collections.includes(collection));
}
