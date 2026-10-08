import { describe, it, expect } from "vitest";
import { computeTotals, statusSteps } from "./format";

describe("order totals", () => {
  it("adds the delivery fee only for delivery orders", () => {
    const lines = [{ unitPrice: 80, quantity: 2 }, { unitPrice: 150, quantity: 1 }];
    expect(computeTotals(lines, "delivery", 50)).toEqual({ subtotal: 310, deliveryFee: 50, total: 360 });
    expect(computeTotals(lines, "pickup", 50)).toEqual({ subtotal: 310, deliveryFee: 0, total: 310 });
    expect(computeTotals(lines, "dine_in", 50).total).toBe(310);
  });
});

describe("tracking steps", () => {
  it("delivery orders go out for delivery instead of ready", () => {
    expect(statusSteps("delivery")).toContain("out_for_delivery");
    expect(statusSteps("delivery")).not.toContain("ready");
    expect(statusSteps("pickup")).toContain("ready");
  });
});
