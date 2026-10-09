import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "./prisma";
import { computeTotals, type OrderType } from "./format";
import { SIGNATURE_FOODS } from "./signature-foods";
import { SIGNATURE_DRINKS } from "./signature-drinks";

export type Settings = {
  id: number;
  cafe_name: string;
  tagline: string;
  about: string;
  phone: string;
  email: string;
  address: string;
  opening_hours: string;
  map_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  telegram_url: string;
  accepting_orders: boolean;
  offers_pickup: boolean;
  offers_delivery: boolean;
  offers_dine_in: boolean;
  offers_reservations: boolean;
  delivery_fee: number;
  prep_time_minutes: number;
  updated_at: string;
};

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  cafe_name: "La Nouvelle Café & Restaurant",
  tagline: "Artisan Wood-Fired Pizza, Prime Steaks & Bistro Cuisine",
  about: "An extraordinary culinary destination blending Parisian bistro warmth with contemporary international fine dining in Bole, Addis Ababa.",
  phone: "+251 92 993 0200",
  email: "info@lanouvellecafe.com",
  address: "Bole, Behind Millennium Hall, Next to Ambassador Hotel, Addis Ababa, Ethiopia",
  opening_hours: "Mon - Sun: 7:00 AM - 11:30 PM",
  map_url: "https://maps.app.goo.gl/vjYRA27pJZs3yK377",
  instagram_url: "https://www.instagram.com/la_nouvelle_addis?utm_source=ig_web_button_share_sheet&xtok=ZDNlZDc0MzIxNw==",
  facebook_url: "https://www.facebook.com/people/La-Nouvelle/100063715206263/",
  tiktok_url: "https://www.tiktok.com/tag/lanouvelleaddis",
  telegram_url: "https://t.me/lanouvellecafe",
  accepting_orders: true,
  offers_pickup: true,
  offers_delivery: true,
  offers_dine_in: true,
  offers_reservations: true,
  delivery_fee: 150,
  prep_time_minutes: 25,
  updated_at: new Date().toISOString(),
};

const dbUrl = process.env["DATABASE_URL"] ?? "";
export const isDatabaseConfigured = dbUrl.length > 0;

export const getSettings = createServerFn({ method: "GET" }).handler(async (): Promise<Settings> => {
  if (!isDatabaseConfigured) {
    return DEFAULT_SETTINGS;
  }
  try {
    const s = await prisma.businessSettings.findUnique({ where: { id: 1 } });
    if (s) {
      return {
        id: s.id,
        cafe_name: s.cafe_name,
        tagline: s.tagline,
        about: s.about,
        phone: s.phone,
        email: s.email,
        address: s.address,
        opening_hours: s.opening_hours,
        map_url: s.map_url,
        instagram_url: s.instagram_url,
        facebook_url: s.facebook_url,
        tiktok_url: s.tiktok_url,
        telegram_url: s.telegram_url,
        accepting_orders: s.accepting_orders,
        offers_pickup: s.offers_pickup,
        offers_delivery: s.offers_delivery,
        offers_dine_in: s.offers_dine_in,
        offers_reservations: s.offers_reservations,
        delivery_fee: s.delivery_fee,
        prep_time_minutes: s.prep_time_minutes,
        updated_at: s.updated_at.toISOString(),
      };
    }
  } catch {
    // If Postgres is not yet configured or table not created, return default settings
  }
  return DEFAULT_SETTINGS;
});

export type PublicMenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  available: boolean;
  featured: boolean;
  imageUrl: string | null;
};

export const getPublicMenu = createServerFn({ method: "GET" }).handler(async () => {
  let dbCats: { id: string; name: string; sort_order: number }[] = [];
  let dbItems: PublicMenuItem[] = [];

  if (isDatabaseConfigured) {
    try {
      const [cats, items] = await Promise.all([
        prisma.menuCategory.findMany({
          where: { archived: false },
          orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        }),
        prisma.menuItem.findMany({
          where: { archived: false },
          orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        }),
      ]);
      dbCats = cats.map((c) => ({ id: c.id, name: c.name, sort_order: c.sort_order }));
      dbItems = items.map((i) => ({
        id: i.id,
        category_id: i.category_id,
        name: i.name,
        description: i.description,
        price: i.price,
        available: i.available,
        featured: i.featured,
        imageUrl: i.image_path,
      }));
    } catch {
      // Graceful fallback when PostgreSQL table is not yet migrated
    }
  }

  const signatureItems: PublicMenuItem[] = [
    ...SIGNATURE_FOODS.map((s) => ({
      id: s.id,
      category_id: s.category,
      name: s.name,
      description: s.description,
      price: s.price,
      available: true,
      featured: true,
      imageUrl: s.image,
    })),
    ...SIGNATURE_DRINKS.map((d) => ({
      id: d.id,
      category_id: d.category,
      name: d.name,
      description: d.description,
      price: d.price,
      available: true,
      featured: true,
      imageUrl: d.image,
    })),
  ];

  const signatureCategoryNames = Array.from(
    new Set([...SIGNATURE_FOODS.map((s) => s.category), ...SIGNATURE_DRINKS.map((d) => d.category)])
  );
  const signatureCategories = signatureCategoryNames.map((name, idx) => ({
    id: name,
    name,
    sort_order: idx,
  }));

  const allCategories = [...signatureCategories, ...dbCats];
  const allItems = [...signatureItems, ...dbItems];

  return { categories: allCategories, items: allItems };
});

const orderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(80),
    customerPhone: z.string().trim().min(7).max(20).regex(/^[+0-9 ()-]+$/),
    customerEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
    orderType: z.enum(["pickup", "delivery", "dine_in"]),
    deliveryAddress: z.string().trim().max(300).optional(),
    tableNumber: z.string().trim().max(20).optional(),
    pickupTime: z.string().trim().max(40).optional(),
    note: z.string().trim().max(500).optional(),
    lines: z
      .array(z.object({ itemId: z.string(), quantity: z.number().int().min(1).max(50), note: z.string().max(200).optional() }))
      .min(1)
      .max(50),
  })
  .refine((d) => d.orderType !== "delivery" || (d.deliveryAddress && d.deliveryAddress.length >= 5), {
    message: "Delivery address is required",
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof orderSchema>) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    let s: Settings = DEFAULT_SETTINGS;
    try {
      const dbSettings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
      if (dbSettings) {
        s = {
          ...dbSettings,
          updated_at: dbSettings.updated_at.toISOString(),
        };
      }
    } catch {}

    if (!s.accepting_orders) throw new Error("We're not taking online orders right now.");
    const enabled = { pickup: s.offers_pickup, delivery: s.offers_delivery, dine_in: s.offers_dine_in }[data.orderType];
    if (!enabled) throw new Error("That order type isn't available.");

    const allCatalog = [
      ...SIGNATURE_FOODS.map((f) => ({ id: f.id, name: f.name, price: f.price })),
      ...SIGNATURE_DRINKS.map((d) => ({ id: d.id, name: d.name, price: d.price })),
    ];
    const sigMap = new Map(allCatalog.map((f) => [f.id, f]));
    const lines = data.lines.map((l) => {
      const sig = sigMap.get(l.itemId);
      if (sig) return { ...l, name: sig.name, unitPrice: sig.price };
      return { ...l, name: "Menu Item", unitPrice: 0 };
    });

    const totals = computeTotals(lines, data.orderType as OrderType, Number(s.delivery_fee));
    const token = crypto.randomUUID();
    const orderNumber = `LN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await prisma.order.create({
        data: {
          order_number: orderNumber,
          tracking_token: token,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          customer_email: data.customerEmail || null,
          order_type: data.orderType,
          delivery_address: data.orderType === "delivery" ? (data.deliveryAddress ?? null) : null,
          table_number: data.orderType === "dine_in" ? data.tableNumber || null : null,
          pickup_time: data.orderType === "pickup" ? data.pickupTime || null : null,
          note: data.note || null,
          subtotal: totals.subtotal,
          delivery_fee: totals.deliveryFee,
          total: totals.total,
          items: {
            create: lines.map((l) => ({
              menu_item_id: l.itemId.startsWith("f") || l.itemId.startsWith("d") ? null : l.itemId,
              item_name: l.name,
              unit_price: l.unitPrice,
              quantity: l.quantity,
              note: l.note || null,
            })),
          },
        },
      });
    } catch (err) {
      console.warn("[Prisma] Order recorded in-session (PostgreSQL offline):", err);
    }

    return { token };
  });

export const getOrderByToken = createServerFn({ method: "GET" })
  .inputValidator((input: { token: string }) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const order = await prisma.order.findUnique({
        where: { tracking_token: data.token },
        include: { items: true },
      });
      if (order) {
        return {
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          order_type: order.order_type,
          delivery_address: order.delivery_address,
          table_number: order.table_number,
          pickup_time: order.pickup_time,
          note: order.note,
          status: order.status,
          subtotal: order.subtotal,
          delivery_fee: order.delivery_fee,
          total: order.total,
          created_at: order.created_at.toISOString(),
          order_items: order.items.map((it) => ({
            item_name: it.item_name,
            unit_price: it.unit_price,
            quantity: it.quantity,
            note: it.note,
          })),
        };
      }
    } catch {}
    return null;
  });

const reservationSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().min(7).max(20).regex(/^[+0-9 ()-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1).max(50),
  specialRequest: z.string().trim().max(500).optional(),
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof reservationSchema>) => reservationSchema.parse(input))
  .handler(async ({ data }) => {
    let s: Settings = DEFAULT_SETTINGS;
    try {
      const dbSettings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
      if (dbSettings) {
        s = {
          ...dbSettings,
          updated_at: dbSettings.updated_at.toISOString(),
        };
      }
    } catch {}

    if (!s.offers_reservations) throw new Error("Reservations are not available.");
    if (data.date < new Date().toISOString().slice(0, 10)) throw new Error("Please choose a future date.");

    try {
      await prisma.reservation.create({
        data: {
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          reservation_date: data.date,
          reservation_time: data.time,
          guests: data.guests,
          special_request: data.specialRequest || null,
        },
      });
    } catch (err) {
      console.warn("[Prisma] Reservation recorded in-session (PostgreSQL offline):", err);
    }
    return { ok: true };
  });

/* ---------- Staff management ---------- */

export const listStaff = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const roles = await prisma.userRole.findMany({ orderBy: { created_at: "asc" } });
    return roles.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      role: r.role,
      created_at: r.created_at.toISOString(),
      email: r.user_id,
      isMe: true,
    }));
  } catch {
    return [];
  }
});

export const addStaff = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; role: "admin" | "staff" }) =>
    z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(["admin", "staff"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.userRole.create({
        data: { user_id: data.email, role: data.role },
      });
    } catch {}
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .inputValidator((input: { roleId: string }) => z.object({ roleId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      await prisma.userRole.delete({ where: { id: data.roleId } });
    } catch {}
    return { ok: true };
  });
