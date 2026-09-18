import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRepairs, getRepairMetrics, linkCustomerToRepair } from "@/lib/repairs.functions";
import { formatGBP } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CreateRepairInvoiceModal } from "@/components/dashboard/CreateRepairInvoiceModal";
import { RepairA4InvoiceModal } from "@/components/dashboard/RepairA4InvoiceModal";
import {
  Plus,
  Receipt,
  Search,
  Printer,
  UserPlus,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// WarrantyClaimLookupModal kept — still useful
const WarrantyClaimLookupModal = lazy(() =>
  import("@/components/dashboard/WarrantyClaimLookupModal").then((m) => ({
    default: m.WarrantyClaimLookupModal,
  })),
);

export const Route = createFileRoute("/_authenticated/dashboard/repairs")({
  component: RepairInvoicesPage,
});

// ── Inline Link Customer Modal ─────────────────────────────────────────────
function LinkCustomerModal({
  repairId,
  onClose,
  onSuccess,
}: {
  repairId: string;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}) {
  const linkFn = useServerFn(linkCustomerToRepair);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    setSaving(true);
    try {
      const result = await linkFn({
        data: {
          repair_id: repairId,
          customer_name: name.trim(),
          customer_phone: phone.trim() || null,
        },
      });
      toast.success("Customer linked successfully!");
      onSuccess(result.customer);
    } catch (err: any) {
      toast.error(err?.message || "Failed to link customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-[#E5E5E5] animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#AC313F]" />
            <span className="font-bold text-sm text-[#171717]">
              Link Customer
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#888888] hover:text-[#171717] hover:bg-[#F7F7F7] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#666666]">
            Links an existing or new customer to this invoice. Financial items remain locked.
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer Name *"
            autoFocus
            className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] bg-white focus:outline-none focus:border-[#AC313F] placeholder:text-[#888888]"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (optional)"
            className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] bg-white focus:outline-none focus:border-[#AC313F] placeholder:text-[#888888]"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 bg-[#AC313F] hover:bg-[#782939] disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
function RepairInvoicesPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listRepairs);
  const metricsFn = useServerFn(getRepairMetrics);

  const [activeTab, setActiveTab] = useState<"all" | "paid" | "unpaid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [page, setPage] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printRepair, setPrintRepair] = useState<any | null>(null);
  const [linkCustomerRepairId, setLinkCustomerRepairId] = useState<string | null>(null);
  const [claimLookupOpen, setClaimLookupOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Map tab → backend status filter (all completed invoices)
  const statusFilter = "completed"; // always show completed (finalized invoices only)

  const { data: repairsData, isLoading } = useQuery({
    queryKey: ["repairs", "invoices", activeTab, debouncedSearch, page],
    queryFn: () =>
      listFn({
        data: {
          status: statusFilter,
          search: debouncedSearch || null,
          page,
          limit: 25,
        },
      }),
    staleTime: 1000 * 15,
  });

  const { data: metrics } = useQuery({
    queryKey: ["repair-metrics"],
    queryFn: () => metricsFn(),
    staleTime: 1000 * 15,
  });

  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ["repairs"] });
    queryClient.invalidateQueries({ queryKey: ["repair-metrics"] });
  }

  // Client-side paid/unpaid filter on top of completed status
  const rows = (repairsData?.rows ?? []) as any[];
  const filteredRows = rows.filter((r) => {
    if (activeTab === "paid") return r.amount_paid_pence >= r.total_price_pence;
    if (activeTab === "unpaid") return r.amount_paid_pence < r.total_price_pence;
    return true;
  });

  // Handle customer link success — optimistically update the row
  function handleCustomerLinked(repairId: string, customer: any) {
    queryClient.setQueryData(
      ["repairs", "invoices", activeTab, debouncedSearch, page],
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          rows: old.rows.map((r: any) =>
            r.id === repairId ? { ...r, customer_id: customer.id, customers: customer } : r,
          ),
        };
      },
    );
    setLinkCustomerRepairId(null);
  }

  // Today's revenue from metrics
  const todayRevenue = formatGBP((metrics?.totalRevenuePence ?? 0) / 100);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#AC313F]" />
            <h1 className="text-lg sm:text-xl font-black text-[#171717] tracking-tight">
              Repair Invoices
            </h1>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Workshop repair tickets, intake logging, and customer collection invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Warranty Lookup */}
          <button
            type="button"
            onClick={() => setClaimLookupOpen(true)}
            className="px-3 py-2 bg-white hover:bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#AC313F]" />
            <span>Warranty Lookup</span>
          </button>

          {/* Primary Action: Create Repair */}
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#AC313F] hover:bg-[#782939] text-white font-extrabold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Repair Invoice</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block">
            Today&apos;s Invoices
          </span>
          <div className="font-extrabold text-2xl text-[#171717] font-mono tabular-nums">
            {metrics?.todayCount ?? 0}
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Today&apos;s Repair Takings
          </span>
          <div className="font-extrabold text-2xl text-emerald-700 font-mono tabular-nums">
            {todayRevenue}
          </div>
        </div>
      </div>

      {/* ── Search & Filters ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search REP #, customer name, phone, device..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] focus:bg-white focus:outline-none focus:border-[#AC313F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "paid", "unpaid"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer capitalize min-h-[34px] ${
                  activeTab === tab
                    ? "bg-[#171717] text-white shadow-2xs"
                    : "bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] hover:bg-[#EAEAEA]"
                }`}
              >
                {tab === "all" ? "All Invoices" : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Invoice List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                  <th className="py-2.5 px-3.5 font-bold">Invoice #</th>
                  <th className="py-2.5 px-3.5 font-bold">Customer</th>
                  <th className="py-2.5 px-3.5 font-bold">Device</th>
                  <th className="py-2.5 px-3.5 font-bold">Work Done</th>
                  <th className="py-2.5 px-3.5 font-bold text-right">Total</th>
                  <th className="py-2.5 px-3.5 font-bold text-center">Status</th>
                  <th className="py-2.5 px-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredRows.length > 0 ? (
                  filteredRows.map((r: any) => {
                    const totalPence = r.total_price_pence || 0;
                    const paidPence = r.amount_paid_pence || 0;
                    const isPaid = paidPence >= totalPence;
                    const hasCustomer = !!r.customer_id;

                    return (
                      <tr key={r.id} className="hover:bg-[#F7F7F7] transition-colors">
                        <td className="py-2.5 px-3.5 font-extrabold font-mono text-[#AC313F] text-xs">
                          {r.rep_number}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="font-bold text-[#171717] block text-xs">
                            {r.customers?.name || "Walk-in Customer"}
                          </span>
                          {r.customers?.phone && (
                            <span className="text-[10px] text-[#666666] font-mono">
                              {r.customers.phone}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-xs text-[#171717] font-semibold">
                          {r.device || r.model}
                        </td>
                        <td className="py-2.5 px-3.5 max-w-[200px] truncate text-xs text-[#666666]">
                          {r.issue}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-black font-mono text-[#171717] text-xs tabular-nums">
                          {formatGBP(totalPence / 100)}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 font-mono">
                              DUE {formatGBP(Math.max(0, totalPence - paidPence) / 100)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setLinkCustomerRepairId(r.id)}
                              className="px-2.5 py-1.5 bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E5E5E5] text-[#171717] font-bold rounded-md text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Add or edit customer for this invoice"
                            >
                              <UserPlus className="w-3 h-3 text-[#666666]" />
                              <span>{hasCustomer ? "Edit Customer" : "+ Customer"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintRepair(r)}
                              className="px-2.5 py-1.5 bg-[#AC313F]/10 hover:bg-[#AC313F]/20 text-[#AC313F] font-extrabold rounded-md text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        title="No repair invoices found"
                        description="Create your first repair invoice using the button above."
                        actionLabel="+ Create Repair Invoice"
                        onAction={() => setCreateModalOpen(true)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-[#E5E5E5]">
            {filteredRows.length > 0 ? (
              filteredRows.map((r: any) => {
                const totalPence = r.total_price_pence || 0;
                const paidPence = r.amount_paid_pence || 0;
                const isPaid = paidPence >= totalPence;
                const hasCustomer = !!r.customer_id;

                return (
                  <div key={r.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#AC313F] font-mono text-xs">
                        {r.rep_number}
                      </span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 font-mono">
                          DUE {formatGBP(Math.max(0, totalPence - paidPence) / 100)}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#171717] block">
                        {r.customers?.name || "Walk-in Customer"}
                      </span>
                      <span className="text-[11px] text-[#666666] block">
                        {r.device} • {r.issue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black font-mono text-[#171717] text-xs">
                        {formatGBP(totalPence / 100)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLinkCustomerRepairId(r.id)}
                          className="px-2 py-1 bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] font-bold rounded-md text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3 text-[#666666]" />
                          <span>{hasCustomer ? "Customer" : "+ Cust"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintRepair(r)}
                          className="px-2 py-1 bg-[#AC313F] text-white font-bold rounded-md text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No repair invoices found"
                description="Create your first repair invoice using the button above."
                actionLabel="+ Create Repair Invoice"
                onAction={() => setCreateModalOpen(true)}
              />
            )}
          </div>

          {/* Pagination */}
          {repairsData && repairsData.total > 25 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              <span>
                Showing {page * 25 + 1}–{Math.min((page + 1) * 25, repairsData.total)} of{" "}
                {repairsData.total} invoices
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 bg-muted hover:bg-border rounded-lg disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * 25 >= repairsData.total}
                  className="px-3 py-1 bg-muted hover:bg-border rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}

      {/* Create Repair Invoice */}
      <CreateRepairInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(repair) => {
          setCreateModalOpen(false);
          refreshAll();
          setPrintRepair(repair);
        }}
      />

      {/* A4 Invoice Print */}
      {printRepair && (
        <RepairA4InvoiceModal
          isOpen={!!printRepair}
          onClose={() => setPrintRepair(null)}
          repair={printRepair}
          onFinalized={refreshAll}
          onCustomerLinked={refreshAll}
        />
      )}

      {/* Link Customer (post-finalization) */}
      {linkCustomerRepairId && (
        <LinkCustomerModal
          repairId={linkCustomerRepairId}
          onClose={() => setLinkCustomerRepairId(null)}
          onSuccess={(customer) => handleCustomerLinked(linkCustomerRepairId, customer)}
        />
      )}

      {/* Warranty Lookup */}
      <Suspense fallback={null}>
        {claimLookupOpen && (
          <WarrantyClaimLookupModal
            isOpen={claimLookupOpen}
            onClose={() => setClaimLookupOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
