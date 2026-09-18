import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const buyPhoneSchema = z.object({
  idempotency_key: z.string().min(1),
  seller_customer_id: z.string().uuid({ message: "Seller customer ID is required" }),
  shift_id: z.string().uuid().optional().nullable(),

  // Device
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  storage: z.string().optional().nullable(),
  colour: z.string().optional().nullable(),
  imei1: z.string().min(1, "IMEI 1 is required"),
  imei2: z.string().optional().nullable(),
  serial_number: z.string().optional().nullable(),

  // Condition
  condition_grade: z.enum(["Excellent", "Good", "Fair", "Faulty"]).default("Good"),
  condition_notes: z.string().optional().nullable(),
  battery_health: z.string().optional().nullable(),
  network_status: z.string().optional().nullable(),
  activation_lock_status: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),

  // Financials
  purchase_price_pence: z.number().int().nonnegative(),
  payment_method: z.enum(["cash", "bank_transfer", "other"]).default("cash"),
  bank_reference: z.string().optional().nullable(),

  // Declaration & Policy (Strict Mandatory Validation)
  seller_declaration_text: z.string().min(1, "Seller declaration text is required"),
  seller_confirmed_at: z.string().min(1, "Declaration confirmation timestamp is required"),
  seller_id_check: z
    .object({ type: z.string().optional(), reference: z.string().optional() })
    .optional()
    .nullable(),
  seller_age_confirmed: z.boolean().refine((v) => v === true, {
    message: "Seller age confirmation (18+) is required",
  }),

  notes: z.string().optional().nullable(),
});

const sellPhoneSchema = z.object({
  idempotency_key: z.string().min(1),
  phone_unit_id: z.string().uuid().optional().nullable(),
  buyer_customer_id: z.string().uuid().optional().nullable(),
  shift_id: z.string().uuid().optional().nullable(),
  selling_price_pence: z.number().int().nonnegative(),
  payment_method: z.enum(["cash", "card", "bank_transfer"]).default("cash"),
  amount_tendered_pence: z.number().int().nonnegative().optional().nullable(),
  warranty_days: z.number().int().nonnegative().optional().nullable(),
  warranty_policy_text: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Direct phone sale parameters (when phone_unit_id is null)
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  colour: z.string().optional().nullable(),
  imei1: z.string().optional().nullable(),
  imei2: z.string().optional().nullable(),
  serial_number: z.string().optional().nullable(),
  condition_grade: z.string().optional().nullable(),
  condition_notes: z.string().optional().nullable(),
  battery_health: z.string().optional().nullable(),
  network_status: z.string().optional().nullable(),
  cost_price_pence: z.number().int().nonnegative().optional().nullable(),
});

const listPhoneUnitsSchema = z.object({
  search: z.string().optional().nullable(),
  status: z.enum(["in_stock", "sold", "all"]).optional().nullable(),
  page: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

// ---------------------------------------------------------------------------
// buyPhone — calls the buy_phone RPC
// ---------------------------------------------------------------------------
export const buyPhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) => buyPhoneSchema.parse(input?.data ?? input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await (context.supabase as any).rpc("buy_phone", {
      p_idempotency_key: data.idempotency_key,
      p_seller_customer_id: data.seller_customer_id,
      p_shift_id: data.shift_id ?? null,
      p_brand: data.brand,
      p_model: data.model,
      p_storage: data.storage ?? null,
      p_colour: data.colour ?? null,
      p_imei1: data.imei1,
      p_imei2: data.imei2 ?? null,
      p_serial_number: data.serial_number ?? null,
      p_condition_grade: data.condition_grade,
      p_condition_notes: data.condition_notes ?? null,
      p_battery_health: data.battery_health ?? null,
      p_network_status: data.network_status ?? null,
      p_activation_lock_status: data.activation_lock_status ?? null,
      p_accessories: data.accessories ?? null,
      p_purchase_price_pence: data.purchase_price_pence,
      p_payment_method: data.payment_method,
      p_bank_reference: data.bank_reference ?? null,
      p_seller_declaration_text: data.seller_declaration_text,
      p_seller_confirmed_at: data.seller_confirmed_at,
      p_seller_id_check: data.seller_id_check ?? null,
      p_seller_age_confirmed: data.seller_age_confirmed,
      p_notes: data.notes ?? null,
    });
    if (error) throw new Error(error.message);
    return result as {
      phone_unit_id: string;
      stock_number: string;
      transaction_id: string;
      duplicate: boolean;
    };
  });

// ---------------------------------------------------------------------------
// sellPhone — calls the sell_phone RPC
// ---------------------------------------------------------------------------
export const sellPhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) => sellPhoneSchema.parse(input?.data ?? input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await (context.supabase as any).rpc("sell_phone", {
      p_idempotency_key: data.idempotency_key,
      p_phone_unit_id: data.phone_unit_id ?? null,
      p_buyer_customer_id: data.buyer_customer_id ?? null,
      p_shift_id: data.shift_id ?? null,
      p_selling_price_pence: data.selling_price_pence,
      p_payment_method: data.payment_method,
      p_amount_tendered_pence: data.amount_tendered_pence ?? null,
      p_warranty_days: data.warranty_days ?? null,
      p_warranty_policy_text: data.warranty_policy_text ?? null,
      p_notes: data.notes ?? null,
      p_brand: data.brand ?? null,
      p_model: data.model ?? null,
      p_storage: data.storage ?? null,
      p_colour: data.colour ?? null,
      p_imei1: data.imei1 ?? null,
      p_imei2: data.imei2 ?? null,
      p_serial_number: data.serial_number ?? null,
      p_condition_grade: data.condition_grade ?? 'Good',
      p_condition_notes: data.condition_notes ?? null,
      p_battery_health: data.battery_health ?? null,
      p_network_status: data.network_status ?? null,
      p_cost_price_pence: data.cost_price_pence ?? null,
    });
    if (error) throw new Error(error.message);
    return result as {
      sale_id: string;
      invoice_number: string;
      sale_item_id: string;
      total_pence: number;
      change_pence: number | null;
      warranty_until: string | null;
      duplicate: boolean;
    };
  });

// ---------------------------------------------------------------------------
// listPhoneUnits — paginated list with search
// ---------------------------------------------------------------------------
export const listPhoneUnits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) =>
    listPhoneUnitsSchema.parse(input?.data ?? input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    let q = db
      .from("phone_units")
      .select(
        `
        id, stock_number, brand, model, storage, colour,
        imei1, imei2, condition_grade, purchase_cost_pence,
        status, purchased_at, sold_at, created_at,
        phone_purchase_transactions(
          id, purchase_number, seller_customer_id, payment_method,
          customers!phone_purchase_transactions_seller_customer_id_fkey(id, name, phone)
        ),
        sale_items(
          id, sale_id, unit_price_pence, line_total_pence,
          warranty_days, warranty_until,
          sales(id, invoice_number, customer_id, created_at,
            customers!sales_customer_id_fkey(id, name, phone)
          )
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(data.page * data.limit, (data.page + 1) * data.limit - 1);

    if (data.status && data.status !== "all") {
      q = q.eq("status", data.status);
    }

    if (data.search?.trim()) {
      const t = data.search.trim();
      q = q.or(
        `stock_number.ilike.%${t}%,brand.ilike.%${t}%,model.ilike.%${t}%,imei1.ilike.%${t}%,imei2.ilike.%${t}%`,
      );
    }

    const { data: rows, count, error } = await q;
    if (error) throw error;

    let combinedRows = [...(rows ?? [])];
    let totalCount = count ?? 0;

    // When viewing "all" or "sold", also include direct phone sales (phones sold directly without prior inventory stock-in)
    if (!data.status || data.status === "all" || data.status === "sold") {
      try {
        // 1. Fetch sale_items that have no phone_unit_id and have a device_snapshot
        const { data: directItems, error: itemsErr } = await db
          .from("sale_items")
          .select("id, sale_id, line_total_pence, cost_price_pence, warranty_days, warranty_until, warranty_policy_text, device_snapshot")
          .is("phone_unit_id", null)
          .limit(100);

        if (itemsErr) {
          console.error("Error fetching direct phone sale items:", itemsErr);
        }

        if (directItems && directItems.length > 0) {
          // Filter to items that have device_snapshot with phone attributes
          const phoneItems = directItems.filter((item: any) => {
            const snap = item.device_snapshot;
            if (!snap || typeof snap !== "object") return false;
            return (
              snap.direct_sale === true ||
              snap.direct_sale === "true" ||
              Boolean(snap.imei1) ||
              Boolean(snap.brand)
            );
          });

          if (phoneItems.length > 0) {
            // 2. Fetch associated sales for invoice numbers and customer ids
            const saleIds = [...new Set(phoneItems.map((pi: any) => pi.sale_id).filter(Boolean))];
            const salesMap = new Map<string, any>();
            const customerMap = new Map<string, any>();

            if (saleIds.length > 0) {
              const { data: salesRows, error: salesErr } = await db
                .from("sales")
                .select("id, invoice_number, created_at, customer_id")
                .in("id", saleIds);

              if (salesErr) {
                console.error("Error fetching sales for direct items:", salesErr);
              }

              if (salesRows) {
                salesRows.forEach((s: any) => salesMap.set(s.id, s));
                const customerIds = [...new Set(salesRows.map((s: any) => s.customer_id).filter(Boolean))];
                if (customerIds.length > 0) {
                  const { data: customerRows } = await db
                    .from("customers")
                    .select("id, name, phone")
                    .in("id", customerIds);
                  if (customerRows) {
                    customerRows.forEach((c: any) => customerMap.set(c.id, c));
                  }
                }
              }
            }

            // 3. Map into unified phone unit rows
            let matchingDirect = phoneItems;
            if (data.search?.trim()) {
              const s = data.search.trim().toLowerCase();
              matchingDirect = matchingDirect.filter((item: any) => {
                const dev = item.device_snapshot || {};
                const sale = salesMap.get(item.sale_id);
                const inv = sale?.invoice_number || "";
                return (
                  inv.toLowerCase().includes(s) ||
                  (dev.brand || "").toLowerCase().includes(s) ||
                  (dev.model || "").toLowerCase().includes(s) ||
                  (dev.imei1 || "").toLowerCase().includes(s)
                );
              });
            }

            const mappedDirect = matchingDirect.map((item: any) => {
              const dev = item.device_snapshot || {};
              const sale = salesMap.get(item.sale_id);
              const cust = sale?.customer_id ? customerMap.get(sale.customer_id) : null;
              const invNum = sale?.invoice_number || "Direct Sale";
              const dateVal = sale?.created_at || new Date().toISOString();

              return {
                id: `direct-${item.id}`,
                stock_number: invNum,
                brand: dev.brand || "Phone",
                model: dev.model || "Handset",
                storage: dev.storage || null,
                colour: dev.colour || null,
                imei1: dev.imei1 || "—",
                imei2: dev.imei2 || null,
                condition_grade: dev.condition_grade || "Good",
                purchase_cost_pence: item.cost_price_pence != null ? Number(item.cost_price_pence) : null,
                status: "sold",
                is_direct_sale: true,
                purchased_at: dateVal,
                sold_at: dateVal,
                created_at: dateVal,
                phone_purchase_transactions: [],
                sale_items: [
                  {
                    id: item.id,
                    sale_id: item.sale_id,
                    unit_price_pence: item.line_total_pence,
                    line_total_pence: item.line_total_pence,
                    warranty_days: item.warranty_days,
                    warranty_until: item.warranty_until,
                    warranty_policy_text: item.warranty_policy_text,
                    device_snapshot: dev,
                    sales: sale ? { ...sale, customers: cust } : null,
                  },
                ],
              };
            });

            combinedRows = [...combinedRows, ...mappedDirect].sort((a, b) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            totalCount += mappedDirect.length;
          }
        }
      } catch (err) {
        console.error("Failed to fetch direct phone sales for listPhoneUnits:", err);
      }
    }

    return { rows: combinedRows, total: totalCount };
  });

// ---------------------------------------------------------------------------
// getPhoneUnitDetail — full detail for one phone unit
// ---------------------------------------------------------------------------
export const getPhoneUnitDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) =>
    z.object({ id: z.string().uuid() }).parse(input?.data ?? input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { data: unit, error } = await db
      .from("phone_units")
      .select(
        `
        *,
        phone_purchase_transactions(
          *,
          customers!phone_purchase_transactions_seller_customer_id_fkey(id, name, phone, address, postcode)
        ),
        sale_items(
          *,
          sales(
            id, invoice_number, created_at, customer_id,
            customers!sales_customer_id_fkey(id, name, phone)
          )
        )
      `,
      )
      .eq("id", data.id)
      .single();
    if (error) throw error;
    return unit;
  });

// ---------------------------------------------------------------------------
// searchPhoneUnits — typeahead for sell form (in_stock only)
// ---------------------------------------------------------------------------
export const searchPhoneUnits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) =>
    z
      .object({ q: z.string().optional().nullable() })
      .parse(input?.data ?? input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const term = (data.q || "").trim();
    if (!term) return [];

    const db = context.supabase as any;
    const { data: rows, error } = await db
      .from("phone_units")
      .select("id, stock_number, brand, model, storage, colour, imei1, condition_grade, purchase_cost_pence")
      .eq("status", "in_stock")
      .or(
        `stock_number.ilike.%${term}%,brand.ilike.%${term}%,model.ilike.%${term}%,imei1.ilike.%${term}%`,
      )
      .order("created_at", { ascending: false })
      .limit(15);
    if (error) throw error;
    return rows ?? [];
  });

// ---------------------------------------------------------------------------
// getPhoneSummary — for Reports page phone panel
// Informational breakdown only; phone revenue is ALREADY in overall sales totals
// ---------------------------------------------------------------------------
export const getPhoneSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as any;
    const { data, error } = await db
      .from("v_phone_units_summary")
      .select("*")
      .single();
    if (error) throw error;
    return data as {
      units_in_stock: number;
      units_sold: number;
      units_total: number;
      stock_cost_value_pence: number;
      total_purchased_pence: number;
      sold_revenue_pence: number;
      sold_cogs_pence: number;
      gross_margin_pence: number;
    };
  });
