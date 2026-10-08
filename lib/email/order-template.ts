import { formatINR } from "@/lib/format";

// Email clients (Gmail, Outlook) CSS classes support cheyyilla → table layout + inline styles.
// Neythra palette: ivory #fcfaf5, ink #0f1e22, rose #a85f67, rule #d7d5cf, taupe #5b514e.

type OrderForEmail = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
  items: { name: string; image: string; size: string; qty: number; unitPrice: number }[];
};

// user input HTML-il direct vekkunnathinu munpu escape — <script> pole kaaryangal inject aakaathirikkaan
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const serif = "Georgia,'Times New Roman',serif";
const sans = "Helvetica,Arial,sans-serif";

export function orderEmailSubject(o: OrderForEmail) {
  return `Order confirmed — ${o.orderNumber} · Neythra`;
}

export function orderEmailHtml(o: OrderForEmail, siteUrl: string) {
  const first = esc(o.customerName.split(" ")[0]);
  const orderUrl = `${siteUrl}/order/${o.orderNumber}`;
  const placed = o.createdAt.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  });

  const rows = o.items
    .map(
      (i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #d7d5cf;width:64px;vertical-align:top;">
          <img src="${siteUrl}${i.image}" width="56" height="70" alt="" style="display:block;object-fit:cover;border:1px solid #d7d5cf;" />
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #d7d5cf;vertical-align:top;">
          <div style="font-family:${serif};font-size:17px;color:#0f1e22;">${esc(i.name)}</div>
          <div style="font-family:${sans};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b514e;margin-top:4px;">
            Size ${esc(i.size)} · Qty ${i.qty}
          </div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #d7d5cf;text-align:right;vertical-align:top;font-family:${serif};font-size:17px;color:#0f1e22;white-space:nowrap;">
          ${formatINR(i.unitPrice * i.qty)}
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f1ea;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fcfaf5;border:1px solid #d7d5cf;">

  <tr><td style="padding:28px 32px;border-bottom:2px solid #e7e4e7;background:#f2fbff;text-align:center;">
    <div style="font-family:${serif};font-size:26px;letter-spacing:8px;color:#0f1e22;">NEYTHRA</div>
  </td></tr>

  <tr><td style="padding:36px 32px 8px;text-align:center;">
    <div style="font-family:${sans};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a85f67;">[ Order Confirmed ]</div>
    <div style="font-family:${serif};font-size:34px;line-height:1.1;color:#0f1e22;margin-top:12px;text-transform:uppercase;">Thank you, ${first}.</div>
    <p style="font-family:${sans};font-size:14px;line-height:1.6;color:#5b514e;margin:14px 0 0;">
      Your order is confirmed and will be dispatched within 3–5 working days. Pay in cash or UPI on delivery.
    </p>
  </td></tr>

  <tr><td style="padding:24px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #d7d5cf;border-bottom:2px solid #d7d5cf;">
      <tr>
        <td style="padding:14px 0;font-family:${sans};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b514e;">Order No.<br/><strong style="font-size:14px;color:#0f1e22;letter-spacing:0;">${o.orderNumber}</strong></td>
        <td style="padding:14px 0;font-family:${sans};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b514e;">Placed<br/><strong style="font-size:14px;color:#0f1e22;letter-spacing:0;">${placed}</strong></td>
        <td style="padding:14px 0;font-family:${sans};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b514e;text-align:right;">Payment<br/><strong style="font-size:14px;color:#0f1e22;letter-spacing:0;">Cash on Delivery</strong></td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>

  <tr><td style="padding:16px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${sans};font-size:14px;color:#5b514e;">
      <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;color:#0f1e22;">${formatINR(o.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;">Shipping</td><td style="padding:4px 0;text-align:right;color:#0f1e22;">${o.shipping === 0 ? "Complimentary" : formatINR(o.shipping)}</td></tr>
      <tr><td style="padding:12px 0 4px;border-top:2px solid #d7d5cf;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0f1e22;font-weight:bold;">Pay on Delivery</td>
          <td style="padding:12px 0 4px;border-top:2px solid #d7d5cf;text-align:right;font-family:${serif};font-size:24px;color:#0f1e22;">${formatINR(o.total)}</td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:20px 32px;">
    <div style="background:#f4f1ea;border:1px solid #d7d5cf;padding:16px 18px;font-family:${sans};font-size:14px;line-height:1.6;color:#5b514e;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0f1e22;font-weight:bold;margin-bottom:6px;">Delivering To</div>
      <strong style="color:#0f1e22;">${esc(o.customerName)}</strong><br/>
      ${esc(o.address1)}<br/>${o.address2 ? `${esc(o.address2)}<br/>` : ""}
      ${esc(o.city)}, ${esc(o.state)} — ${esc(o.pincode)}<br/>${esc(o.phone)}
    </div>
  </td></tr>

  <tr><td style="padding:8px 32px 36px;text-align:center;">
    <a href="${orderUrl}" style="display:inline-block;background:#a85f67;color:#fcfaf5;text-decoration:none;font-family:${sans};font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:15px 30px;">View Your Order</a>
  </td></tr>

  <tr><td style="padding:20px 32px;border-top:2px solid #e3d8da;background:#f2fbff;text-align:center;font-family:${sans};font-size:11px;letter-spacing:1px;color:#857374;">
    © 2026 NEYTHRA · Contemporary Indian Fashion<br/>Questions? Simply reply to this email.
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

/** HTML kaanikkaatha email apps-inu plain text version */
export function orderEmailText(o: OrderForEmail, siteUrl: string) {
  const lines = o.items.map((i) => `- ${i.name} (Size ${i.size}) x${i.qty}  ${formatINR(i.unitPrice * i.qty)}`).join("\n");
  return `Thank you, ${o.customerName.split(" ")[0]}.

Your Neythra order ${o.orderNumber} is confirmed. Pay on delivery.

${lines}

Subtotal: ${formatINR(o.subtotal)}
Shipping: ${o.shipping === 0 ? "Complimentary" : formatINR(o.shipping)}
Total (Cash on Delivery): ${formatINR(o.total)}

Delivering to: ${o.customerName}, ${o.address1}${o.address2 ? ", " + o.address2 : ""}, ${o.city}, ${o.state} ${o.pincode}

View your order: ${siteUrl}/order/${o.orderNumber}`;
}
