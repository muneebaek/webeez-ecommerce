"use client";

import { useEffect } from "react";
import { useOrders } from "@/store/orders";

// Rendered only when the confirmation page's token is valid: saves the order in this browser,
// so the product pages of these pieces offer "Write a review".
export default function RememberOrder({ orderNumber, token, productIds }: { orderNumber: string; token: string; productIds: string[] }) {
  const remember = useOrders((s) => s.remember);
  const key = productIds.join(",");

  useEffect(() => {
    remember({ orderNumber, token, productIds: key ? key.split(",") : [] });
  }, [remember, orderNumber, token, key]);

  return null;
}
