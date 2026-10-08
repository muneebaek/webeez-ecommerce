// Pricing rules — shared by the browser (cart display) and the server (order total).
// Change it in one place and it updates everywhere.

export const FREE_SHIPPING_MIN = 5000; // free at ₹5,000 and above
export const SHIPPING_FEE = 150;
export const MAX_QTY = 10;

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
