import { z } from "zod";
import { MAX_QTY } from "./pricing";

// Checkout form — the server validates with these rules (browser validation can be bypassed, the server can't)

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.email("Please enter a valid email").trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  address1: z.string().trim().min(5, "Please enter your address").max(160),
  address2: z.string().trim().max(160).optional().transform((v) => v || undefined),
  city: z.string().trim().min(2, "Please enter your city").max(60),
  state: z.enum(INDIAN_STATES, { error: "Please choose your state" }),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  notes: z.string().trim().max(300).optional().transform((v) => v || undefined),
});

// Items coming from the cart — only id, size, qty; the server reads prices from the database
export const orderItemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      size: z.string().min(1),
      qty: z.number().int().min(1).max(MAX_QTY),
    }),
  )
  .min(1, "Your bag is empty")
  .max(50);

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email").trim().toLowerCase(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
