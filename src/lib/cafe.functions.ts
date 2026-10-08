import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeTotals } from "./format";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type Settings = Database["public"]["Tables"]["business_settings"]["Row"];

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("business_settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  return data;
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
  const sb = publicClient();
  const [cats, items] = await Promise.all([
    sb.from("menu_categories").select("id,name,sort_order").eq("archived", false).order("sort_order").order("name"),
    sb
      .from("menu_items")
      .select("id,category_id,name,description,price,available,featured,image_path,sort_order")
      .eq("archived", false)
      .order("sort_order")
      .order("name"),
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (items.error) throw new Error(items.error.message);

  // Images live in a private bucket; sign them for display.
  const paths = items.data.map((i) => i.image_path).filter((p): p is string => !!p);
  const urlByPath = new Map<string, string>();
  if (paths.length) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.from("menu-images").createSignedUrls(paths, 60 * 60 * 24);
    data?.forEach((d) => d.path && d.signedUrl && urlByPath.set(d.path, d.signedUrl));
  }
  const menu: PublicMenuItem[] = items.data.map((i) => ({
    id: i.id,
    category_id: i.category_id,
    name: i.name,
    description: i.description,
    price: Number(i.price),
    available: i.available,
    featured: i.featured,
    imageUrl: i.image_path ? (urlByPath.get(i.image_path) ?? null) : null,
  }));
  return { categories: cats.data, items: menu };
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
      .array(z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(1).max(50), note: z.string().max(200).optional() }))
      .min(1)
      .max(50),
  })
  .refine((d) => d.orderType !== "delivery" || (d.deliveryAddress && d.deliveryAddress.length >= 5), {
    message: "Delivery address is required",
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof orderSchema>) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s } = await supabaseAdmin.from("business_settings").select("*").eq("id", 1).single();
    if (!s?.accepting_orders) throw new Error("We're not taking online orders right now.");
    const enabled = { pickup: s.offers_pickup, delivery: s.offers_delivery, dine_in: s.offers_dine_in }[data.orderType];
    if (!enabled) throw new Error("That order type isn't available.");

    const ids = [...new Set(data.lines.map((l) => l.itemId))];
    const { data: items, error } = await supabaseAdmin
      .from("menu_items")
      .select("id,name,price,available,archived")
      .in("id", ids);
    if (error) throw new Error(error.message);
    const byId = new Map(items.map((i) => [i.id, i]));
    const lines = data.lines.map((l) => {
      const it = byId.get(l.itemId);
      if (!it || it.archived || !it.available) throw new Error(`${it?.name ?? "An item"} is no longer available.`);
      return { ...l, name: it.name, unitPrice: Number(it.price) };
    });
    const totals = computeTotals(lines, data.orderType, Number(s.delivery_fee));

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
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
      })
      .select("id,tracking_token")
      .single();
    if (oErr) throw new Error(oErr.message);
    const { error: iErr } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        menu_item_id: l.itemId,
        item_name: l.name,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        note: l.note || null,
      })),
    );
    if (iErr) throw new Error(iErr.message);
    return { token: order.tracking_token };
  });

export const getOrderByToken = createServerFn({ method: "GET" })
  .inputValidator((input: { token: string }) => z.object({ token: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number,customer_name,customer_phone,order_type,delivery_address,table_number,pickup_time,note,status,subtotal,delivery_fee,total,created_at,order_items(item_name,unit_price,quantity,note)",
      )
      .eq("tracking_token", data.token)
      .maybeSingle();
    return order;
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s } = await supabaseAdmin.from("business_settings").select("offers_reservations").eq("id", 1).single();
    if (!s?.offers_reservations) throw new Error("Reservations are not available.");
    if (data.date < new Date().toISOString().slice(0, 10)) throw new Error("Please choose a future date.");
    const { error } = await supabaseAdmin.from("reservations").insert({
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      reservation_date: data.date,
      reservation_time: data.time,
      guests: data.guests,
      special_request: data.specialRequest || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Staff management (admins only) ---------- */

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Only admins can manage staff.");
}

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("id,user_id,role,created_at");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map(users.users.map((u) => [u.id, u.email ?? ""]));
    return (roles ?? []).map((r) => ({ ...r, email: emailById.get(r.user_id) ?? "", isMe: r.user_id === context.userId }));
  });

export const addStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: "admin" | "staff" }) =>
    z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(["admin", "staff"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const user = users.users.find((u) => u.email?.toLowerCase() === data.email);
    if (!user) throw new Error("No account with that email yet. Ask them to create one on the staff sign-in page first.");
    const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roleId: string }) => z.object({ roleId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await context.supabase.from("user_roles").select("user_id").eq("id", data.roleId).single();
    if (row?.user_id === context.userId) throw new Error("You can't remove your own access.");
    const { error } = await context.supabase.from("user_roles").delete().eq("id", data.roleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
