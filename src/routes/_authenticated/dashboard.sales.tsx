import { createFileRoute } from "@tanstack/react-router";
import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSales, getSaleDetail } from "@/lib/sales.functions";
import { formatGBP } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import type { InvoiceData } from "@/components/dashboard/Invoice";
import { InvoiceModal } from "@/components/dashboard/Invoice";
import {
  CreditCard,
  Search,
  FileText,
  Loader2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Banknote,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/sales")({
  component: DashboardSalesPage,
});

type SaleStatus = "completed" | "partially_refunded" | "refunded" | "voided";

function DashboardSalesPage() {
  const listSalesFn = useServerFn(listSales);
  const getSaleDetailFn = useServerFn(getSaleDetail);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales", debouncedSearch, statusFilter, page],
    queryFn: () =>
      listSalesFn({
        data: {
          search: debouncedSearch || undefined,
          status: (statusFilter as SaleStatus) || undefined,
          page,
          limit: 25,
        },
      }),
    staleTime: 1000 * 30, // 30s cache
  });

  const sales = salesData?.rows ?? [];
  const totalCount = salesData?.total ?? 0;

  const handleOpenInvoice = async (saleId: string) => {
    setLoadingInvoiceId(saleId);
    try {
      const detail = await getSaleDetailFn({ data: { id: saleId } });
      const inv: InvoiceData = {
        kind: "sale",
        number: detail.invoice_number ?? `INV-${detail.id.slice(0, 8).toUpperCase()}`,
        date: new Date(detail.created_at).toLocaleString("en-GB"),
        customer: detail.customers,
        lines: (detail.sale_items || []).map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price_pence / 100,
          total: item.line_total_pence / 100,
        })),
        discount: detail.discount_pence / 100,
        total: detail.total_pence / 100,
        paid: true,
        paymentMethod: detail.payments[0]?.method,
        warrantyUntil: detail.warranty_until,
      };
      setSelectedInvoice(inv);
    } catch (err: unknown) {
      toastError(err, "Failed to load sale receipt");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const hasFilters = Boolean(search || statusFilter);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(0);
  };

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Sales Transaction History</h1>
            <PageHelpButton
              pageTitle="Sales Log"
              pageKey="sales"
              steps={[
                "Review completed retail sales, payment methods, and receipts.",
                "Filter by status (Completed, Refunded, Voided) or search invoice number.",
                "Click Receipt to view, download, or reprint a customer invoice.",
              ]}
              firstTimeTip="Tip: Use search or status filters to quickly locate past customer transactions."
            />
          </div>
          <p className="db-page-subtitle">
            Authoritative retail checkout ledger, itemized receipts, and payment method audit.
          </p>
        </div>

        {/* Quick count pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-muted-foreground shadow-xs shrink-0 self-start sm:self-auto">
          <Receipt className="w-3.5 h-3.5 text-brand" />
          <span>
            Total Transactions: <strong className="text-foreground">{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Standardized Compact Toolbar (Section 9 & 24) */}
      <div className="p-3 bg-white border border-border rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoice # or customer…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="db-input !pl-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="db-input text-xs font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="partially_refunded">Partially Refunded</option>
              <option value="refunded">Refunded</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {/* Clear Filter Button */}
          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Dense Table Card */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Receipt className="w-6 h-6 text-brand" />}
              title="No sales matching criteria"
              description="Try adjusting your invoice search or status filters."
              actionLabel={hasFilters ? "Reset Filters" : undefined}
              onAction={hasFilters ? handleClearFilters : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="db-th">Invoice #</th>
                  <th className="db-th">Date &amp; Time</th>
                  <th className="db-th">Customer</th>
                  <th className="db-th">Payment</th>
                  <th className="db-th">Status</th>
                  <th className="db-th text-right">Total (£)</th>
                  <th className="db-th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const paymentMethod = sale.payment_method?.toLowerCase() || "cash";
                  return (
                    <tr key={sale.id} className="db-tr-hover">
                      <td className="db-td font-mono font-bold text-ink whitespace-nowrap">
                        {sale.invoice_number ?? `#${sale.id.slice(0, 8).toUpperCase()}`}
                      </td>
                      <td className="db-td text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(sale.created_at).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="db-td font-semibold text-foreground">
                        {(sale.customers as { name: string } | null)?.name || "Walk-in Customer"}
                      </td>
                      <td className="db-td whitespace-nowrap">
                        {paymentMethod === "cash" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Banknote className="w-3 h-3" /> Cash
                          </span>
                        ) : paymentMethod === "card" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <CreditCard className="w-3 h-3" /> Card
                          </span>
                        ) : paymentMethod === "bank_transfer" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            <Building2 className="w-3 h-3" /> Bank Transfer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-foreground border border-border capitalize">
                            {paymentMethod.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="db-td whitespace-nowrap">
                        <StatusBadge
                          status={sale.status || "completed"}
                          size="sm"
                          dot
                        />
                      </td>
                      <td className="db-td text-right font-black text-ink tabular-nums text-sm">
                        {formatGBP(sale.total_pence / 100)}
                      </td>
                      <td className="db-td text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(sale.id)}
                          disabled={loadingInvoiceId === sale.id}
                          aria-label={`View receipt for sale ${sale.invoice_number}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-muted border border-border text-ink font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                          {loadingInvoiceId === sale.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalCount > 25 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>
              Showing {page * 25 + 1}–{Math.min((page + 1) * 25, totalCount)} of {totalCount} sales
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-foreground">
                Page {page + 1} of {Math.ceil(totalCount / 25)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * 25 >= totalCount}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        {selectedInvoice && (
          <InvoiceModal data={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
        )}
      </Suspense>
    </div>
  );
}
