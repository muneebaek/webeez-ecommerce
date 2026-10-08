"use server";

import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validators";

export type NewsletterState = { status: "idle" | "error" | "success"; message?: string };

// "Keep in Touch" form → Subscriber table. Same email veendum vannaal error alla (upsert).
export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };

  try {
    await db.subscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
    return { status: "success", message: "Thank you — you're on the list." };
  } catch (e) {
    console.error("subscribe failed", e);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
