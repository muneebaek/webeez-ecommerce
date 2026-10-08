// Pricing rules — browser (cart display) + server (order total) randum ithu thanne use cheyyunnu.
// Oru sthalathu maattiyaal ellaayidathum maarum.

export const FREE_SHIPPING_MIN = 5000; // ₹5,000-um athinu mukalilum free
export const SHIPPING_FEE = 150;
export const MAX_QTY = 10;

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
