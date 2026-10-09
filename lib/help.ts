import { FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

// Content for the /help/[topic] pages (footer links). Plain data so one page template renders every topic.

export type HelpBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] };

export type HelpTopic = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; blocks: HelpBlock[] }[];
};

// Size chart + measuring tips — used by the Size Guide page and the size guide popup on product pages
export const SIZE_CHART = {
  caption: "Body measurements in centimetres (inches)",
  head: ["Size", "Bust", "Waist", "Hip"],
  rows: [
    ["XS", "81 (32)", "66 (26)", "89 (35)"],
    ["S", "86 (34)", "71 (28)", "94 (37)"],
    ["M", "91 (36)", "76 (30)", "99 (39)"],
    ["L", "97 (38)", "81 (32)", "104 (41)"],
    ["XL", "102 (40)", "86 (34)", "109 (43)"],
  ],
};

export const MEASURE_TIPS = [
  "Bust — around the fullest part of the chest, keeping the tape level.",
  "Waist — around the narrowest part of the torso.",
  "Hip — around the fullest part of the hips, feet together.",
];

export const helpTopics: HelpTopic[] = [
  {
    slug: "shipping",
    title: "Shipping",
    intro: "Every piece is checked by hand before it leaves the studio. Here is how and when your order reaches you.",
    sections: [
      {
        heading: "Delivery charges",
        blocks: [
          {
            type: "list",
            items: [
              `Free shipping on orders of ${formatINR(FREE_SHIPPING_MIN)} and above.`,
              `A flat ${formatINR(SHIPPING_FEE)} on orders below ${formatINR(FREE_SHIPPING_MIN)}.`,
              "We currently ship within India only.",
            ],
          },
        ],
      },
      {
        heading: "Timelines",
        blocks: [
          { type: "p", text: "Orders are dispatched within 3–5 working days. Delivery usually takes 2–4 days in metro cities and 4–7 days elsewhere." },
          { type: "p", text: "You can check where your order is at any time on the Track an Order page, using your order number and email." },
        ],
      },
      {
        heading: "Cash on Delivery",
        blocks: [{ type: "p", text: "All orders are Cash on Delivery. Please keep the exact amount ready — our courier partners may not carry change." }],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    intro: "If a piece isn't right, we'll make it right. Returns and exchanges are free within 14 days of delivery.",
    sections: [
      {
        heading: "What can be returned",
        blocks: [
          {
            type: "list",
            items: [
              "Unworn, unwashed pieces with all tags attached.",
              "Requests raised within 14 days of delivery.",
              "Accessories in their original packaging.",
            ],
          },
        ],
      },
      {
        heading: "How it works",
        blocks: [
          {
            type: "list",
            items: [
              "Reply to your order confirmation email with your order number and the piece you'd like to return or exchange.",
              "We arrange a pickup within 2–3 working days.",
              "Once the piece reaches the studio and passes a quality check, we ship the exchange or refund you.",
            ],
          },
        ],
      },
      {
        heading: "Refunds",
        blocks: [{ type: "p", text: "As orders are paid on delivery, refunds are made by bank transfer or UPI within 5–7 working days of the quality check." }],
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size Guide",
    intro: "Our pieces are cut for an easy, relaxed fit. Measure over light clothing and choose the size closest to your bust and hip.",
    sections: [
      {
        heading: "Body measurements",
        blocks: [
          { type: "table", ...SIZE_CHART },
        ],
      },
      {
        heading: "How to measure",
        blocks: [
          { type: "list", items: MEASURE_TIPS },
          { type: "p", text: "Between two sizes? Choose the larger one for a softer drape. Scarves and accessories are One Size." },
        ],
      },
    ],
  },
  {
    slug: "contact",
    title: "Inquiries",
    intro: "Questions about a piece, an order or a custom request — the studio team is happy to help.",
    sections: [
      {
        heading: "Reach the studio",
        blocks: [
          { type: "p", text: "Reply to your order confirmation email and it comes straight to our studio team. We answer within one working day." },
          { type: "p", text: "For order status, the Track an Order page shows the latest update instantly." },
        ],
      },
      {
        heading: "Studio hours",
        blocks: [{ type: "list", items: ["Monday – Saturday, 10 am – 6 pm IST", "Closed on Sundays and public holidays"] }],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy",
    intro: "We collect only what we need to deliver your order, and we never sell your data.",
    sections: [
      {
        heading: "What we collect",
        blocks: [
          {
            type: "list",
            items: [
              "Your name, email, phone and delivery address — to process and deliver your order.",
              "Your email, if you join the newsletter — you can unsubscribe at any time.",
              "Your bag and saved pieces are stored only in your own browser.",
            ],
          },
        ],
      },
      {
        heading: "How we use it",
        blocks: [
          { type: "p", text: "Order details are used to confirm, ship and support your purchase. We share your address only with our courier partner." },
          { type: "p", text: "No card or bank details are collected online — all orders are paid on delivery." },
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    intro: "By placing an order with Neythra you agree to the terms below.",
    sections: [
      {
        heading: "Orders & pricing",
        blocks: [
          {
            type: "list",
            items: [
              "All prices are in Indian Rupees and include applicable taxes.",
              "An order is confirmed once you receive the confirmation email.",
              "We may cancel an order if a piece is unavailable; you will be informed by email.",
            ],
          },
        ],
      },
      {
        heading: "Handmade pieces",
        blocks: [
          { type: "p", text: "Our fabrics are woven and finished by hand. Slight variations in colour and weave are part of each piece's character, not a defect." },
        ],
      },
    ],
  },
];

export const getHelpTopic = (slug: string) => helpTopics.find((t) => t.slug === slug);
