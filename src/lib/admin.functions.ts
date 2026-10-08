import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "./prisma";
import { DEFAULT_SETTINGS, type Settings } from "./cafe.functions";

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async (): Promise<Settings> => {
  try {
    const s = await prisma.businessSettings.findUnique({ where: { id: 1 } });
    if (s) {
      return {
        ...s,
        updated_at: s.updated_at.toISOString(),
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
});

export const updateAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((input: any) => input)
  .handler(async ({ data }) => {
    try {
      const { id, updated_at, ...patch } = data;
      await prisma.businessSettings.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          ...patch,
          delivery_fee: Number(patch.delivery_fee) || 0,
          prep_time_minutes: Number(patch.prep_time_minutes) || 0,
        },
        update: {
          ...patch,
          delivery_fee: Number(patch.delivery_fee) || 0,
          prep_time_minutes: Number(patch.prep_time_minutes) || 0,
        },
      });
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not update settings");
    }
  });

export const getAdminOrders = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { created_at: "desc" },
      take: 100,
    });
    return orders.map((o) => ({
      ...o,
      created_at: o.created_at.toISOString(),
      updated_at: o.updated_at.toISOString(),
      order_items: o.items.map((i) => ({
        ...i,
      })),
    }));
  } catch {
    return [];
  }
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; status: any }) => z.object({ id: z.string(), status: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      await prisma.order.update({
        where: { id: data.id },
        data: { status: data.status as any },
      });
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not update order status");
    }
  });

export const getAdminReservations = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: [{ reservation_date: "asc" }, { reservation_time: "asc" }],
      take: 100,
    });
    return reservations.map((r) => ({
      ...r,
      created_at: r.created_at.toISOString(),
    }));
  } catch {
    return [];
  }
});

export const updateReservationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; status?: any; reservation_date?: string; reservation_time?: string }) =>
    z.object({ id: z.string(), status: z.string().optional(), reservation_date: z.string().optional(), reservation_time: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { id, ...patch } = data;
      await prisma.reservation.update({
        where: { id },
        data: {
          ...(patch.status ? { status: patch.status as any } : {}),
          ...(patch.reservation_date ? { reservation_date: patch.reservation_date } : {}),
          ...(patch.reservation_time ? { reservation_time: patch.reservation_time } : {}),
        },
      });
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not update reservation");
    }
  });

export const getAdminMenu = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [cats, items] = await Promise.all([
      prisma.menuCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] }),
      prisma.menuItem.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] }),
    ]);
    return {
      cats: cats.map((c) => ({ ...c, created_at: c.created_at.toISOString() })),
      items: items.map((i) => ({
        ...i,
        created_at: i.created_at.toISOString(),
        updated_at: i.updated_at.toISOString(),
        signedUrl: i.image_path,
      })),
    };
  } catch {
    return { cats: [], items: [] };
  }
});

export const saveMenuItem = createServerFn({ method: "POST" })
  .inputValidator((input: any) => input)
  .handler(async ({ data }) => {
    try {
      const { id, signedUrl, created_at, updated_at, ...row } = data;
      if (id) {
        await prisma.menuItem.update({
          where: { id },
          data: {
            ...row,
            price: Number(row.price) || 0,
            sort_order: Number(row.sort_order) || 0,
          },
        });
      } else {
        await prisma.menuItem.create({
          data: {
            ...row,
            price: Number(row.price) || 0,
            sort_order: Number(row.sort_order) || 0,
          },
        });
      }
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not save menu item");
    }
  });

export const toggleArchiveMenuItem = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; archived: boolean }) => z.object({ id: z.string(), archived: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    try {
      await prisma.menuItem.update({
        where: { id: data.id },
        data: { archived: data.archived },
      });
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not archive item");
    }
  });

export const saveMenuCategory = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; sort_order: number }) => z.object({ name: z.string(), sort_order: z.number() }).parse(input))
  .handler(async ({ data }) => {
    try {
      await prisma.menuCategory.create({
        data: { name: data.name, sort_order: data.sort_order },
      });
      return { ok: true };
    } catch (err: any) {
      throw new Error(err.message || "Could not create category");
    }
  });

export const getAdminMetrics = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, reservationsCount] = await Promise.all([
      prisma.order.findMany({
        where: { created_at: { gte: today } },
        select: { status: true, total: true },
      }),
      prisma.reservation.count({
        where: {
          created_at: { gte: today },
          status: { not: "cancelled" },
        },
      }),
    ]);

    const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
    const sales = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return { activeOrders, sales, reservationsCount };
  } catch {
    return { activeOrders: 0, sales: 0, reservationsCount: 0 };
  }
});
