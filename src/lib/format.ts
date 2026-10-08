export function formatBirr(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ETB`;
}

export const ORDER_STATUSES = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_TYPE_LABEL = {
  pickup: "Pickup",
  delivery: "Delivery",
  dine_in: "Dine-in",
} as const;
export type OrderType = keyof typeof ORDER_TYPE_LABEL;

/** Steps a customer sees for a given order type. */
export function statusSteps(type: OrderType): OrderStatus[] {
  return type === "delivery"
    ? ["received", "confirmed", "preparing", "out_for_delivery", "completed"]
    : ["received", "confirmed", "preparing", "ready", "completed"];
}

/** Server-side order total: subtotal from item prices, delivery fee only for delivery. */
export function computeTotals(
  lines: { unitPrice: number; quantity: number }[],
  type: OrderType,
  deliveryFee: number,
) {
  const subtotal = Math.round(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) * 100) / 100;
  const fee = type === "delivery" ? deliveryFee : 0;
  return { subtotal, deliveryFee: fee, total: Math.round((subtotal + fee) * 100) / 100 };
}
