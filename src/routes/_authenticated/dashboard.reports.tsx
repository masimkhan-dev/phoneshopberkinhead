import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReports } from "@/lib/reports.functions";
import { formatGBP } from "@/lib/utils";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { CardSkeleton } from "@/components/dashboard/TableSkeleton";
import {
  AlertCircle,
  Calendar,
  BarChart3,
  RotateCcw,
  Smartphone,
  CalendarCheck,
  Banknote,
  CreditCard,
  Building2,
  Calculator,
  Receipt,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  Wrench,
  Package,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/reports")({
  component: ReportsPage,
});

function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateFriendly(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ReportsPage() {
  const getReportsFn = useServerFn(getReports);

  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [showCustomDate, setShowCustomDate] = useState(false);

  const datePresets = useMemo(() => {
    const now = new Date();
    const todayStr = formatDateString(now);

    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const thisWeekStartStr = formatDateString(monday);

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthStartStr = formatDateString(firstOfMonth);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = formatDateString(thirtyDaysAgo);

    return [
      { label: "Today", from: todayStr, to: todayStr },
      { label: "This Week", from: thisWeekStartStr, to: todayStr },
      { label: "This Month", from: thisMonthStartStr, to: todayStr },
      { label: "Last 30 Days", from: thirtyDaysAgoStr, to: todayStr },
      { label: "All Time", from: undefined, to: undefined },
    ];
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", dateRange],
    queryFn: () => getReportsFn({ data: dateRange }),
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  const activeRangeText = useMemo(() => {
    if (!data) return "";
    if (!dateRange.from && !dateRange.to) {
      return `All available records · ${formatDateFriendly(data.fromDate)} to ${formatDateFriendly(data.toDate)}`;
    }
    if (dateRange.from && dateRange.to && dateRange.from === dateRange.to) {
      return `Today · ${formatDateFriendly(dateRange.from)}`;
    }
    return `${formatDateFriendly(dateRange.from || data.fromDate)} to ${formatDateFriendly(dateRange.to || data.toDate)}`;
  }, [dateRange, data]);

  if (isLoading || !data) {
    return (
      <div className="db-page space-y-6">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand" />
            <h1 className="db-page-title">Business Operations Report</h1>
          </div>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  // Executive snapshot metrics
  const totalRecordedRevenuePence = (data.netSalesPence ?? 0) + (data.repairRevenuePence ?? 0);
  const knownCogsPence = data.cogsPence ?? 0;
  const expensesPence = data.expensesTotalPence ?? 0;
  const estimatedProfitPence = data.netProfitPence ?? 0;
  const hasMissingCosts =
    data.isMarginPending ||
    (data.unknownCostItemsCount ?? 0) > 0 ||
    ((data.phoneSummary?.direct_sales_unknown_cost_count ?? 0) > 0);
  const missingCostCount =
    (data.unknownCostItemsCount ?? 0) || (data.phoneSummary?.direct_sales_unknown_cost_count ?? 0);

  const potentialGrossMarginPence = data.stockValueRetailPence - data.stockValueCostPence;
  const potentialMarginPercent =
    data.stockValueRetailPence > 0
      ? ((potentialGrossMarginPence / data.stockValueRetailPence) * 100).toFixed(1)
      : null;

  return (
    <div className="db-page space-y-6">
      {/* Header & Compact Date Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Business Operations Report</h1>
            <PageHelpButton
              pageTitle="Reports"
              pageKey="reports"
              steps={[
                "Review the Business Snapshot at a glance for overall performance.",
                "Daily Closing shows physical till drawer reconciliation (Cash, Card, Bank).",
                "System Sales Activity details POS register, phone sales and repair tickets.",
                "Review missing cost alerts to ensure accurate profit calculation.",
              ]}
              firstTimeTip="Tip: Use the compact date toolbar above to view performance by Today, This Week, or Custom ranges."
            />
          </div>
          <p className="db-page-subtitle font-medium">
            {activeRangeText}
          </p>
        </div>

        {/* Compact Date Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-muted/60 border border-border rounded-xl text-xs">
            {datePresets.map((p) => {
              const isActive =
                !showCustomDate &&
                (p.from === dateRange.from || (!p.from && !dateRange.from)) &&
                (p.to === dateRange.to || (!p.to && !dateRange.to));
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setShowCustomDate(false);
                    setDateRange({ from: p.from, to: p.to });
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs whitespace-nowrap ${
                    isActive
                      ? "bg-brand text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCustomDate(!showCustomDate)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs inline-flex items-center gap-1 whitespace-nowrap ${
                showCustomDate || (dateRange.from && !datePresets.some(p => p.from === dateRange.from && p.to === dateRange.to))
                  ? "bg-brand text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              }`}
            >
              <span>Custom</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCustomDate ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Custom Date Inputs (Revealed only when Custom is chosen) */}
      {showCustomDate && (
        <div className="db-card p-3 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center gap-2.5 animate-in fade-in duration-150">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">Custom Date Range:</span>
          <input
            type="date"
            value={dateRange.from || ""}
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            className="border border-border rounded-lg px-2.5 py-1 text-xs outline-none font-medium bg-background text-foreground focus:border-brand focus:ring-1 focus:ring-brand min-h-[34px]"
          />
          <span className="text-muted-foreground text-xs font-medium">to</span>
          <input
            type="date"
            value={dateRange.to || ""}
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            className="border border-border rounded-lg px-2.5 py-1 text-xs outline-none font-medium bg-background text-foreground focus:border-brand focus:ring-1 focus:ring-brand min-h-[34px]"
          />
          {(dateRange.from || dateRange.to) && (
            <button
              type="button"
              onClick={() => {
                setDateRange({});
                setShowCustomDate(false);
              }}
              className="text-muted-foreground hover:text-brand font-bold text-xs flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> Reset to All Time
            </button>
          )}
        </div>
      )}

      {/* ── 1. BUSINESS SNAPSHOT (EXECUTIVE SUMMARY) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-muted-foreground">
            Executive Business Snapshot
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Overview of recorded activity for selected period
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Total Recorded Revenue */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-brand">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
              <span>Total Recorded Revenue</span>
              <TrendingUp className="w-4 h-4 text-brand" />
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums tracking-tight">
              {formatGBP(totalRecordedRevenuePence / 100)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Sales {formatGBP(data.netSalesPence / 100)} + Repairs {formatGBP(data.repairRevenuePence / 100)}
            </div>
          </div>

          {/* Known COGS */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-border">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
              <span>Known Cost of Goods (COGS)</span>
              <Calculator className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-black text-foreground tabular-nums tracking-tight">
              {formatGBP(knownCogsPence / 100)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Direct inventory acquisition costs
            </div>
          </div>

          {/* Store Expenses */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-rose-500">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
              <span>Store Expenses</span>
              <Receipt className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-destructive tabular-nums tracking-tight">
              {formatGBP(expensesPence / 100)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Operating expenses &amp; bills
            </div>
          </div>

          {/* Estimated Operating Profit */}
          <div
            className={`db-card p-4 space-y-1.5 border-t-2 ${
              estimatedProfitPence >= 0
                ? "border-t-emerald-600 bg-emerald-500/5"
                : "border-t-destructive bg-destructive/5"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-between">
              <span className={estimatedProfitPence >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
                {hasMissingCosts ? "Estimated Profit*" : "Net Operating Profit"}
              </span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div
              className={`text-2xl font-black tabular-nums tracking-tight ${
                estimatedProfitPence >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {formatGBP(estimatedProfitPence / 100)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {hasMissingCosts ? "*Pending acquisition costs on some sales" : "Revenue less COGS & expenses"}
            </div>
          </div>
        </div>

        {/* Data Quality Notice if missing costs */}
        {hasMissingCosts && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Data Quality Notice:</strong> {missingCostCount} transaction{missingCostCount > 1 ? "s have" : " has"} unrecorded acquisition cost. Profit figures above are estimated and exclude missing item costs.
              </span>
            </div>
            <Link
              to="/dashboard/sales"
              className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200 hover:underline shrink-0"
            >
              <span>Review Sales Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── 2. DAILY SALES CLOSING (TILL RECONCILIATION) ── */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-brand" />
              <h2 className="text-base font-extrabold text-foreground">
                Daily Sales Closing &amp; Till Reconciliation
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wide border border-border">
                Based on Daily Sales Closing
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Physical till takings (Cash + Card + Bank) less store expenses recorded during shift/day close.
            </p>
          </div>

          <Link
            to="/dashboard/daily-sales"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
          >
            <span>Enter Daily Closing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Closing Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Cash Takings */}
          <div className="db-card p-3.5 space-y-1 border-t-2 border-t-emerald-600">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Cash Takings</span>
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-foreground tabular-nums tracking-tight truncate">
              {formatGBP((data.dailyClosing?.cashPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">Physical drawer cash</div>
          </div>

          {/* Card Takings */}
          <div className="db-card p-3.5 space-y-1 border-t-2 border-t-blue-600">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Card Takings</span>
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-black text-foreground tabular-nums tracking-tight truncate">
              {formatGBP((data.dailyClosing?.cardPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">Terminal total</div>
          </div>

          {/* Bank Takings */}
          <div className="db-card p-3.5 space-y-1 border-t-2 border-t-purple-600">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Bank Takings</span>
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-lg font-black text-foreground tabular-nums tracking-tight truncate">
              {formatGBP((data.dailyClosing?.bankPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">Direct transfers</div>
          </div>

          {/* Total Takings */}
          <div className="db-card p-3.5 space-y-1 border-t-2 border-t-brand bg-brand/5">
            <div className="text-[10px] font-extrabold text-foreground uppercase flex items-center justify-between">
              <span>Total Takings</span>
              <Calculator className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="text-lg font-black text-brand tabular-nums tracking-tight truncate">
              {formatGBP((data.dailyClosing?.totalSalesPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">Cash+Card+Bank</div>
          </div>

          {/* Expenses */}
          <div className="db-card p-3.5 space-y-1 border-t-2 border-t-rose-500">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Expenses</span>
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-lg font-black text-destructive tabular-nums tracking-tight truncate">
              {formatGBP((data.expensesTotalPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">Store expenses</div>
          </div>

          {/* Net Cashflow (Takings Less Expenses) */}
          <div
            className={`db-card p-3.5 space-y-1 border-t-2 ${
              (data.dailyClosing?.netProfitPence ?? 0) >= 0
                ? "border-t-emerald-600 bg-emerald-500/5"
                : "border-t-destructive bg-destructive/5"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase flex items-center justify-between">
              <span
                className={
                  (data.dailyClosing?.netProfitPence ?? 0) >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-destructive"
                }
              >
                Net Cashflow
              </span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div
              className={`text-lg font-black tabular-nums tracking-tight truncate ${
                (data.dailyClosing?.netProfitPence ?? 0) >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {formatGBP((data.dailyClosing?.netProfitPence ?? 0) / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">Takings less expenses</div>
          </div>
        </div>

        {/* Daily Breakdown Table or Clear Empty State */}
        {data.dailyClosing?.entries && data.dailyClosing.entries.length > 0 ? (
          <div className="db-card !p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-foreground">
                Daily Closing Breakdown Log ({data.dailyClosing.entries.length} day{data.dailyClosing.entries.length > 1 ? "s" : ""})
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">
                {data.fromDate} ➔ {data.toDate}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="db-table">
                <thead>
                  <tr>
                    <th className="db-th">Date</th>
                    <th className="db-th">Staff</th>
                    <th className="db-th text-right">Cash</th>
                    <th className="db-th text-right">Card</th>
                    <th className="db-th text-right">Bank</th>
                    <th className="db-th text-right">Total Takings</th>
                    <th className="db-th">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyClosing.entries.map((entry) => (
                    <tr key={entry.id} className="db-tr-hover">
                      <td className="db-td font-extrabold text-foreground whitespace-nowrap">
                        {entry.entry_date}
                      </td>
                      <td className="db-td font-medium text-muted-foreground whitespace-nowrap">
                        {entry.staff_name}
                      </td>
                      <td className="db-td text-right font-mono tabular-nums text-foreground">
                        {formatGBP(entry.cash_amount)}
                      </td>
                      <td className="db-td text-right font-mono tabular-nums text-foreground">
                        {formatGBP(entry.card_amount)}
                      </td>
                      <td className="db-td text-right font-mono tabular-nums text-foreground">
                        {formatGBP(entry.bank_amount)}
                      </td>
                      <td className="db-td text-right font-mono font-black tabular-nums text-foreground">
                        {formatGBP(entry.total_amount)}
                      </td>
                      <td className="db-td text-xs text-muted-foreground max-w-xs truncate">
                        {entry.notes || "—"}
                      </td>
                    </tr>
                  ))}
                  {/* Summary Totals Row */}
                  <tr className="bg-muted/40 font-extrabold border-t-2 border-border">
                    <td className="db-td text-foreground" colSpan={2}>
                      Total for Selected Period ({data.dailyClosing.entries.length} recorded day{data.dailyClosing.entries.length > 1 ? "s" : ""})
                    </td>
                    <td className="db-td text-right font-mono tabular-nums text-foreground">
                      {formatGBP((data.dailyClosing.cashPence ?? 0) / 100)}
                    </td>
                    <td className="db-td text-right font-mono tabular-nums text-foreground">
                      {formatGBP((data.dailyClosing.cardPence ?? 0) / 100)}
                    </td>
                    <td className="db-td text-right font-mono tabular-nums text-foreground">
                      {formatGBP((data.dailyClosing.bankPence ?? 0) / 100)}
                    </td>
                    <td className="db-td text-right font-mono font-black tabular-nums text-foreground">
                      {formatGBP((data.dailyClosing.totalSalesPence ?? 0) / 100)}
                    </td>
                    <td className="db-td text-xs text-muted-foreground">
                      Net Cashflow: {formatGBP((data.dailyClosing.netProfitPence ?? 0) / 100)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No daily sales closings recorded for this period</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                The £0.00 takings above do not mean no sales occurred. Daily sales closing is completed at end-of-shift to reconcile physical till drawer takings.
              </p>
            </div>
            <Link
              to="/dashboard/daily-sales"
              className="px-3.5 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand/90 transition-all shrink-0 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Record Daily Closing</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── 3. SYSTEM SALES ACTIVITY (POS & INVOICES) ── */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              System Sales Activity
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sales recorded through POS register, repair invoices, and phone sales during this period (separate from till closing).
            </p>
          </div>
        </div>

        {/* Detailed Sales Activity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {/* Retail & Phone Sales */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-border">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Retail &amp; Phone Sales</span>
              <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl font-black text-foreground tabular-nums tracking-tight">
              {formatGBP(data.grossRevenuePence / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Net sales (Returns: {formatGBP(data.refundsPence / 100)})
            </div>
          </div>

          {/* Repair Revenue */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-border">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Repair Revenue</span>
              <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl font-black text-foreground tabular-nums tracking-tight">
              {formatGBP(data.repairRevenuePence / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Completed repair payments
            </div>
          </div>

          {/* Total Recorded Revenue */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-brand bg-brand/5">
            <div className="text-[10px] font-extrabold text-foreground uppercase flex items-center justify-between">
              <span>Total Recorded Revenue</span>
              <TrendingUp className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="text-xl font-black text-brand tabular-nums tracking-tight">
              {formatGBP(totalRecordedRevenuePence / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Retail + Repair receipts
            </div>
          </div>

          {/* COGS */}
          <div className="db-card p-4 space-y-1.5 border-t-2 border-t-amber-600">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Cost of Goods (COGS)</span>
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-800 dark:text-amber-400 tabular-nums tracking-tight">
              {formatGBP(data.cogsPence / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {data.isMarginPending ? `⚠️ Pending cost on ${data.unknownCostItemsCount} item(s)` : `Gross Margin: ${formatGBP(data.grossProfitPence / 100)}`}
            </div>
          </div>

          {/* Estimated Operating Profit */}
          <div
            className={`db-card p-4 space-y-1.5 border-t-2 ${
              data.netProfitPence >= 0
                ? "border-t-emerald-600 bg-emerald-500/5"
                : "border-t-destructive bg-destructive/5"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase flex items-center justify-between">
              <span className={data.netProfitPence >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
                {hasMissingCosts ? "Estimated Profit*" : "Net Operating Profit"}
              </span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div
              className={`text-xl font-black tabular-nums tracking-tight ${
                data.netProfitPence >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {formatGBP(data.netProfitPence / 100)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Less expenses ({formatGBP(data.expensesTotalPence / 100)})
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown + Stock Valuation (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Payment Breakdown */}
          <div className="db-card space-y-2">
            <div>
              <h3 className="db-card-title">System-Recorded Payment Methods</h3>
              <p className="text-[11px] text-muted-foreground">
                Based on completed POS register &amp; invoice receipts (separate from physical daily till closings).
              </p>
            </div>
            <div className="space-y-0 divide-y divide-border text-xs pt-1">
              {[
                { label: "Cash Receipts", value: formatGBP(data.cashPence / 100), note: "POS transaction cash" },
                { label: "Card Payments", value: formatGBP(data.cardPence / 100), note: "POS terminal checkouts" },
                { label: "Bank Transfers", value: formatGBP(data.bankPence / 100), note: "Direct invoice transfers" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <div>
                    <span className="text-foreground font-semibold block">{row.label}</span>
                    <span className="text-[10px] text-muted-foreground">{row.note}</span>
                  </div>
                  <span className="font-extrabold text-foreground font-mono tabular-nums text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Valuation */}
          <div className="db-card space-y-2">
            <div>
              <h3 className="db-card-title">Stock Valuation Overview</h3>
              <p className="text-[11px] text-muted-foreground">
                Current listed inventory valuation and potential retail margin across all products.
              </p>
            </div>
            <div className="space-y-0 divide-y divide-border text-xs pt-1">
              <div className="flex justify-between items-center py-2.5">
                <div>
                  <span className="text-foreground font-semibold block">Stock Value (at Cost)</span>
                  <span className="text-[10px] text-muted-foreground">Total acquisition cost of inventory</span>
                </div>
                <span className="font-extrabold text-foreground font-mono tabular-nums text-sm">
                  {formatGBP(data.stockValueCostPence / 100)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <div>
                  <span className="text-foreground font-semibold block">Stock Value (at Retail)</span>
                  <span className="text-[10px] text-muted-foreground">Listed shelf selling price total</span>
                </div>
                <span className="font-extrabold text-foreground font-mono tabular-nums text-sm">
                  {formatGBP(data.stockValueRetailPence / 100)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 font-bold">
                <div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Potential Gross Margin</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {potentialMarginPercent ? `${potentialMarginPercent}% potential markup margin` : "Realized upon sale"}
                  </span>
                </div>
                <span className="tabular-nums font-mono text-sm text-emerald-700 dark:text-emerald-400 font-black">
                  {formatGBP(potentialGrossMarginPence / 100)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. PHONE SALES ACTIVITY & HANDSET STOCK ── */}
        {data.phoneSummary && (
          <div className="db-card space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-extrabold text-foreground">
                  Phone Buy &amp; Sell Operational Summary
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground italic">
                Phone revenue and COGS are already included in System Sales Activity above.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Phones Sold</p>
                <p className="text-lg font-black text-foreground tabular-nums">
                  {data.phoneSummary.units_sold ?? 0} units
                </p>
                {Boolean(data.phoneSummary.direct_sales_count) && (
                  <span className="inline-block text-[10px] font-bold text-blue-600">
                    {data.phoneSummary.direct_sales_count} direct sales
                  </span>
                )}
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Handset Revenue</p>
                <p className="text-lg font-black text-foreground tabular-nums">
                  {formatGBP((data.phoneSummary.sold_revenue_pence ?? 0) / 100)}
                </p>
                <p className="text-[10px] text-muted-foreground">Total sale proceeds</p>
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Known Handset COGS</p>
                <p className="text-lg font-black text-foreground tabular-nums">
                  {formatGBP((data.phoneSummary.sold_cogs_pence ?? 0) / 100)}
                </p>
                <p className="text-[10px] text-muted-foreground">Recorded acquisition cost</p>
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Known Gross Margin</p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatGBP((data.phoneSummary.gross_margin_pence ?? 0) / 100)}
                </p>
                <p className="text-[10px] text-muted-foreground">On units with known cost</p>
              </div>
            </div>

            {/* Handset Stock Sub-bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-xl text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Current Handset Stock:</span>
                <span className="font-bold text-foreground">{data.phoneSummary.units_in_stock ?? 0} units</span>
                <span className="text-muted-foreground">({formatGBP((data.phoneSummary.stock_cost_value_pence ?? 0) / 100)} cost value)</span>
              </div>
              <Link
                to="/dashboard/phone-buy-sell"
                className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
              >
                <span>View Phone Inventory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Warning if direct phone sales are missing costs */}
            {data.phoneSummary.direct_sales_unknown_cost_count > 0 && (
              <div className="p-2.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Notice:</strong> {data.phoneSummary.direct_sales_unknown_cost_count} direct phone sale(s) have unrecorded cost (Revenue: {formatGBP(data.phoneSummary.direct_sales_unknown_cost_revenue_pence / 100)}). Margin shown is computed on units with known purchase costs only.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── 5. SUPPLIER BALANCES ── */}
        {data.supplierBalances.length > 0 && (
          <div className="db-card !p-0 overflow-hidden">
            <h3 className="db-card-title px-5 pt-5">Supplier Balances</h3>
            <div className="overflow-x-auto">
              <table className="db-table">
                <thead>
                  <tr>
                    <th className="db-th">Supplier</th>
                    <th className="db-th text-right">PO Total</th>
                    <th className="db-th text-right">Total Paid</th>
                    <th className="db-th text-right">Balance Owed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.supplierBalances.map((sup) => (
                    <tr key={sup.supplier_id} className="db-tr-hover">
                      <td className="db-td font-bold text-ink">{sup.name}</td>
                      <td className="db-td text-right font-mono tabular-nums text-muted-foreground">
                        {formatGBP((sup.total_ordered_pence ?? 0) / 100)}
                      </td>
                      <td className="db-td text-right font-mono tabular-nums text-muted-foreground">
                        {formatGBP((sup.total_paid_pence ?? 0) / 100)}
                      </td>
                      <td
                        className={`db-td text-right font-extrabold font-mono tabular-nums ${sup.balance_pence > 0 ? "text-destructive" : "text-emerald-700"}`}
                      >
                        {formatGBP((sup.balance_pence ?? 0) / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

