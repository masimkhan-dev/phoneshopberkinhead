import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  listSuppliers,
} from "@/lib/suppliers.functions";
import { listAllActiveProducts } from "@/lib/products.functions";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ModalShell } from "@/components/ui/modal-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatGBP } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Package,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/purchases")({
  component: DashboardPurchasesPage,
});

function DashboardPurchasesPage() {
  const queryClient = useQueryClient();
  const listOrdersFn = useServerFn(listPurchaseOrders);
  const createPOFn = useServerFn(createPurchaseOrder);
  const receivePOFn = useServerFn(receivePurchaseOrder);
  const listSuppliersFn = useServerFn(listSuppliers);
  const listProductsFn = useServerFn(listAllActiveProducts);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    supplier_id: "",
    notes: "",
    items: [] as {
      product_id: string;
      product_name: string;
      qty_ordered: number;
      unit_cost_pence: number;
    }[],
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => listOrdersFn({ data: { page: 0, limit: 100 } }),
    staleTime: 1000 * 30, // 30s cache
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => listSuppliersFn(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => listProductsFn({ data: {} }),
    staleTime: 1000 * 60 * 2,
  });

  const orders = (ordersData?.rows ?? []).filter((order) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (order.po_number ?? "").toLowerCase().includes(term) ||
      (order.suppliers?.name ?? "").toLowerCase().includes(term)
    );
  });

  const handleAddItem = (productId: string) => {
    const prod = products.find((product) => product.id === productId);
    if (!prod) return;
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: prod.id,
          product_name: prod.name,
          qty_ordered: 1,
          unit_cost_pence: prod.cost_price_pence || 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const formOrderTotalPence = form.items.reduce(
    (sum, it) => sum + it.qty_ordered * it.unit_cost_pence,
    0,
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id) {
      toastError("Please select a supplier");
      return;
    }
    if (form.items.length === 0) {
      toastError("Please add at least one line item");
      return;
    }

    setSubmitting(true);
    try {
      await createPOFn({
        data: {
          supplier_id: form.supplier_id,
          notes: form.notes || null,
          items: form.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            qty_ordered: item.qty_ordered,
            unit_cost_pence: item.unit_cost_pence,
          })),
        },
      });
      toastSuccess("Purchase order created successfully");
      setModalOpen(false);
      setForm({ supplier_id: "", notes: "", items: [] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    } catch (err: unknown) {
      toastError(err, "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveOrder = async (po: (typeof orders)[number]) => {
    const items = po.purchase_order_items
      .map((item) => ({
        po_item_id: item.id,
        qty_received: item.qty_ordered - item.qty_received,
      }))
      .filter((item) => item.qty_received > 0);

    if (items.length === 0) {
      toastError("This order has no outstanding quantity to receive");
      return;
    }
    if (!confirm("Receive this order and update inventory stock counts?")) return;
    setReceivingId(po.id);
    try {
      await receivePOFn({
        data: {
          po_id: po.id,
          idempotency_key: crypto.randomUUID(),
          update_cost_price: true,
          notes: "Full outstanding quantity received from dashboard",
          items,
        },
      });
      toastSuccess("Stock received and inventory updated!");
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: unknown) {
      console.error("Error receiving stock:", err);
      toastError(err, "Failed to receive stock");
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Purchase Orders &amp; Stock Ingestion</h1>
            <PageHelpButton
              pageTitle="Purchases"
              pageKey="purchases"
              steps={[
                "Create purchase orders to procure wholesale stock and repair parts from suppliers.",
                "Select product line items, ordered quantities, and unit cost prices.",
                "When goods are delivered to the shop, click Receive Stock.",
                "Inventory levels and cost records update automatically on receipt.",
              ]}
              firstTimeTip="Tip: Stock quantities and cost price references update automatically upon receiving an order."
            />
          </div>
          <p className="db-page-subtitle">
            Wholesale inventory procurement, replacement parts ledger, and supplier stock ingestion.
          </p>
        </div>

        {/* Standardized Toolbar Right: Create Action */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary !py-2.5 !px-4 !text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Standardized Compact Toolbar Left: Search (Section 24) */}
      <div className="p-3 bg-white border border-border rounded-xl shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search PO # or supplier name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="db-input !pl-9 text-xs"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing <strong className="text-foreground">{orders.length}</strong> orders
        </div>
      </div>

      {/* Standardized Dense Table (Section 23) */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6 text-brand" />}
              title="No purchase orders found"
              description="Create a purchase order when ordering wholesale stock or replacement parts."
              actionLabel="+ Create Purchase Order"
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[700px]">
              <thead>
                <tr>
                  <th className="db-th">PO Reference</th>
                  <th className="db-th">Order Date</th>
                  <th className="db-th">Supplier</th>
                  <th className="db-th">Items Summary</th>
                  <th className="db-th">Status</th>
                  <th className="db-th text-right">Total Cost (£)</th>
                  <th className="db-th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => {
                  const isReceived = po.status === "received";
                  const itemCount = po.purchase_order_items?.length ?? 0;
                  return (
                    <tr key={po.id} className="db-tr-hover">
                      <td className="db-td font-mono font-bold text-ink whitespace-nowrap">
                        {po.po_number ?? `#${po.id.slice(0, 8).toUpperCase()}`}
                      </td>
                      <td className="db-td text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(po.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="db-td font-semibold text-foreground">
                        {po.suppliers?.name || "Standard Wholesale Supplier"}
                      </td>
                      <td className="db-td text-xs text-muted-foreground">
                        {itemCount > 0 ? (
                          <span>
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                            {po.purchase_order_items?.[0] ? ` (${po.purchase_order_items[0].product_name})` : ""}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="db-td whitespace-nowrap">
                        <StatusBadge
                          status={isReceived ? "received" : "in_progress"}
                          label={isReceived ? "Received" : "Pending Delivery"}
                          size="sm"
                          dot
                        />
                      </td>
                      <td className="db-td text-right font-black text-ink tabular-nums text-sm whitespace-nowrap">
                        {formatGBP(po.total_pence / 100)}
                      </td>
                      <td className="db-td text-right whitespace-nowrap">
                        {!isReceived ? (
                          <button
                            type="button"
                            onClick={() => handleReceiveOrder(po)}
                            disabled={receivingId === po.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                          >
                            {receivingId === po.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Receiving…</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Receive Stock</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ModalShell for New Purchase Order (Section 26) */}
      <ModalShell
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Create Purchase Order"
        description="Add wholesale supplier parts or accessories to inventory procurement ledger"
        icon={ShoppingBag}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-outline !py-2 !px-4 !text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e as any)}
              disabled={submitting}
              className="btn-primary !py-2 !px-5 !text-xs disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Purchase Order</span>
                </>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Select Supplier <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
              className="db-input text-xs font-medium"
            >
              <option value="">-- Choose Approved Wholesale Supplier --</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Add Inventory Product / Component Line Item
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddItem(e.target.value);
                  e.target.value = "";
                }
              }}
              className="db-input text-xs font-medium"
            >
              <option value="">-- Choose Product / Part to Order --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current Stock: {product.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          {form.items.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Order Line Items ({form.items.length})
                </span>
                <span className="text-xs font-black text-brand tabular-nums">
                  Subtotal: {formatGBP(formOrderTotalPence / 100)}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border text-xs"
                  >
                    <span className="font-bold text-ink flex-1 truncate">
                      {item.product_name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">Qty:</span>
                        <input
                          type="number"
                          min={1}
                          value={item.qty_ordered}
                          onChange={(e) => {
                            const q = parseInt(e.target.value) || 1;
                            setForm((prev) => ({
                              ...prev,
                              items: prev.items.map((it, i) =>
                                i === idx ? { ...it, qty_ordered: q } : it,
                              ),
                            }));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-border rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">Cost £:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={(item.unit_cost_pence / 100).toFixed(2)}
                          onChange={(e) => {
                            const c = Math.round((parseFloat(e.target.value) || 0) * 100);
                            setForm((prev) => ({
                              ...prev,
                              items: prev.items.map((it, i) =>
                                i === idx ? { ...it, unit_cost_pence: c } : it,
                              ),
                            }));
                          }}
                          className="w-20 px-2 py-1 bg-white border border-border rounded-lg text-xs font-bold text-right tabular-nums"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Remove line item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Internal Procurement Notes / Tracking Reference
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Supplier delivery ref #12345, expected Monday morning"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="db-input text-xs"
            />
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
