import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { orderEmailHtml, orderEmailSubject, orderEmailText } from "./order-template";

// Gmail SMTP — .env-il SMTP_USER (gmail address) + SMTP_PASS (16-char App Password)
function getTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null; // env illenkil email skip (order fail aakilla)
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: { user, pass: pass.replace(/\s/g, "") }, // App Password-il spaces undenkil kalayum
  });
}

/**
 * Order confirmation email ayakkum, success aayaal Order.emailSent = true.
 * Ethenkilum error vannaalum throw cheyyilla — email kaaranam order fail aakaruthu.
 */
export async function sendOrderEmail(orderId: string): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP_USER / SMTP_PASS not set — skipping order email");
    return false;
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? `Neythra <${process.env.SMTP_USER}>`,
      to: order.email,
      replyTo: process.env.SMTP_USER,
      subject: orderEmailSubject(order),
      html: orderEmailHtml(order, siteUrl),
      text: orderEmailText(order, siteUrl),
    });
    await db.order.update({ where: { id: order.id }, data: { emailSent: true } });
    return true;
  } catch (e) {
    console.error("[email] order email failed", order.orderNumber, e);
    return false;
  }
}
