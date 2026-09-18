import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardSummary } from "@/lib/dashboard.functions";
import { formatGBP } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  TrendingUp,
  Zap,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Wrench,
  Package,
  Receipt,
  Smartphone,
  CreditCard,
  Clock,
} from "lucide-react";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { CardSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SummaryCard } from "@/components/ui/summary-card";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const getSummaryFn = useServerFn(getDashboardSummary);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getSummaryFn(),
    staleTime: 1000 * 30, // 30s cache
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-[#666666]">
              Loading counter takings, repair workshop, and inventory...
            </p>
          </div>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-xs font-bold text-[#DC2626] bg-[#DC2626]/8 rounded-xl border border-[#DC2626]/20 flex items-center justify-between">
        <span>Failed to load live dashboard metrics. Please refresh the terminal session.</span>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-[#DC2626] text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-[#B91C1C]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. Page Header & Operational Context ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#AC313F]" />
            <h1 className="text-lg sm:text-xl font-black text-[#171717] tracking-tight">
              Counter Overview
            </h1>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Live counter sales, workshop tickets, and inventory status for today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <PageHelpButton
            pageTitle="Counter Overview"
            pageKey="overview"
            steps={[
              "Monitor today's total POS register sales and repair collection takings.",
              "Review pending repair tickets and low-stock reorder warnings.",
              "Complete the Daily Sales reconciliation before closing the till.",
            ]}
            firstTimeTip="This screen gives real-time counter visibility. Use Quick Operations to initiate sales or book repairs."
          />
        </div>
      </div>

      {/* ── 2. Till / Daily Sales Reconciled Banner ── */}
      {data.todayDailySale ? (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-emerald-900">
                Today&apos;s Store Closing Recorded:
              </span>{" "}
              <span className="font-black font-mono tabular-nums text-[#171717]">
                Total {formatGBP(data.todayDailySale.total_amount)}
              </span>{" "}
              <span className="text-emerald-800 text-[11px] block sm:inline mt-0.5 sm:mt-0">
                (Cash: {formatGBP(data.todayDailySale.cash_amount)} • Card: {formatGBP(data.todayDailySale.card_amount)} • Bank: {formatGBP(data.todayDailySale.bank_amount)})
              </span>
              {data.todayDailySale.staff_name && (
                <span className="text-emerald-700 text-[10px] block mt-0.5">
                  Reconciled by: {data.todayDailySale.staff_name}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/dashboard/daily-sales"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>View / Edit Closing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <CalendarCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="text-amber-900">End-of-Day Till Closing Pending:</strong>
              <span className="text-amber-800 text-[11px] block sm:inline sm:ml-1">
                Record today&apos;s physical cash, card terminal, and bank totals before closing the store.
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/daily-sales"
            className="px-3 py-1.5 rounded-lg bg-[#AC313F] text-white font-bold text-xs hover:bg-[#782939] transition-colors shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <span>Enter Daily Closing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── 3. High-Density Operational Metric Cards (4 Columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Counter POS Sales */}
        <SummaryCard
          label="Today's POS Sales"
          value={formatGBP(data.todaySalesPence / 100)}
          subtitle={`${data.todaySaleCount} sales • Cash: ${formatGBP(data.todayCashPence / 100)} • Card: ${formatGBP(data.todayCardPence / 100)}`}
          accentColor="brand"
          icon={ShoppingCart}
        />

        {/* Repair Revenue Today */}
        <SummaryCard
          label="Repair Takings Today"
          value={formatGBP(data.todayRepairRevenuePence / 100)}
          subtitle={`${data.pendingRepairs} pending tickets in workshop`}
          accentColor="neutral"
          icon={Wrench}
        />

        {/* Inventory Stock Valuation */}
        <SummaryCard
          label="Stock Valuation"
          value={formatGBP((data.totalStockValuePence ?? 0) / 100)}
          subtitle={
            data.lowStock > 0
              ? `${data.lowStock} products below threshold`
              : "All stock levels optimal"
          }
          accentColor={data.lowStock > 0 ? "warning" : "success"}
          icon={Package}
        />

        {/* Today's Store Expenses */}
        <SummaryCard
          label="Today's Expenses"
          value={formatGBP((data.todayExpensesPence ?? 0) / 100)}
          subtitle="Recorded shop outgoings"
          accentColor="neutral"
          icon={Receipt}
        />
      </div>

      {/* ── 4. Main Operational Workspace: Quick Actions & Live Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column (8 cols): Fast Actions & Recent Transactions */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Quick Counter Operations Bar */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#AC313F]" />
              <span>Quick Counter Operations</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <Link
                to="/dashboard/pos"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#AC313F] text-white font-bold text-xs hover:bg-[#782939] transition-colors shadow-2xs min-h-[42px]"
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>New POS Sale</span>
              </Link>

              <Link
                to="/dashboard/repairs"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#171717] text-white font-bold text-xs hover:bg-[#262626] transition-colors shadow-2xs min-h-[42px]"
              >
                <Wrench className="w-4 h-4 text-[#AC313F] shrink-0" />
                <span>New Repair</span>
              </Link>

              <Link
                to="/dashboard/phone-buy-sell"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#171717] font-bold text-xs hover:bg-[#F7F7F7] hover:border-[#AC313F] transition-colors min-h-[42px]"
              >
                <Smartphone className="w-4 h-4 text-[#AC313F] shrink-0" />
                <span>Phone Trade</span>
              </Link>

              <Link
                to="/dashboard/daily-sales"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#171717] font-bold text-xs hover:bg-[#F7F7F7] hover:border-[#AC313F] transition-colors min-h-[42px]"
              >
                <CalendarCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Daily Closing</span>
              </Link>

              <Link
                to="/dashboard/expenses"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#171717] font-bold text-xs hover:bg-[#F7F7F7] hover:border-[#AC313F] transition-colors min-h-[42px]"
              >
                <Receipt className="w-4 h-4 text-[#666666] shrink-0" />
                <span>Add Expense</span>
              </Link>

              <Link
                to="/dashboard/products"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#171717] font-bold text-xs hover:bg-[#F7F7F7] hover:border-[#AC313F] transition-colors min-h-[42px]"
              >
                <Package className="w-4 h-4 text-[#666666] shrink-0" />
                <span>Stock &amp; Parts</span>
              </Link>
            </div>
          </div>

          {/* Today's Sales Activity Table */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-[#AC313F]" />
                <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Today&apos;s Sales Activity
                </span>
                <span className="text-[11px] font-bold text-[#666666] bg-[#F7F7F7] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                  {data.recentSales.length} recent
                </span>
              </div>
              <Link
                to="/dashboard/sales"
                className="text-xs font-bold text-[#AC313F] hover:text-[#782939] flex items-center gap-1 transition-colors"
              >
                <span>Full Sales Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentSales.length === 0 ? (
              <EmptyState
                title="No sales recorded today"
                description="Transactions completed at the POS register will appear here in real time."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                      <th className="pb-2 font-bold">Invoice</th>
                      <th className="pb-2 font-bold">Customer</th>
                      <th className="pb-2 font-bold text-right">Time</th>
                      <th className="pb-2 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {data.recentSales.map((s) => {
                      const timeStr = s.created_at
                        ? new Date(s.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                      return (
                        <tr key={s.id} className="hover:bg-[#F7F7F7] transition-colors">
                          <td className="py-2.5 font-bold text-[#171717] font-mono">
                            {s.invoice_number}
                          </td>
                          <td className="py-2.5 text-[#666666]">
                            {(s.customers as { name: string } | null)?.name || "Walk-in Customer"}
                          </td>
                          <td className="py-2.5 text-right text-[#666666] font-mono text-[11px]">
                            {timeStr}
                          </td>
                          <td className="py-2.5 text-right font-black text-[#171717] font-mono tabular-nums">
                            {formatGBP((s.total_pence ?? 0) / 100)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Workshop Queue & Inventory Alerts */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* Workshop Tickets Status */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[#AC313F]" />
                <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Workshop Queue
                </span>
              </div>
              <span className="text-xs font-black font-mono bg-[#171717] text-white px-2 py-0.5 rounded">
                {data.pendingRepairs}
              </span>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              {data.pendingRepairs === 0
                ? "All workshop repairs are completed or returned. No active pending tickets."
                : `${data.pendingRepairs} device repairs currently pending diagnostic, parts, or customer collection.`}
            </p>

            <Link
              to="/dashboard/repairs"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-bold text-[#171717] hover:border-[#AC313F] hover:text-[#AC313F] transition-colors"
            >
              <span>Manage Repair Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-[#AC313F]" />
                <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Stock Alerts
                </span>
              </div>
              {data.lowStock > 0 ? (
                <span className="text-xs font-black font-mono bg-[#F59E0B] text-white px-2 py-0.5 rounded">
                  {data.lowStock} Low
                </span>
              ) : (
                <span className="text-xs font-black font-mono bg-[#10B981] text-white px-2 py-0.5 rounded">
                  OK
                </span>
              )}
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              {data.lowStock > 0
                ? `${data.lowStock} products or spare parts are at or below reorder threshold.`
                : "All tracked products are above minimum reorder levels."}
            </p>

            <Link
              to="/dashboard/products"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-bold text-[#171717] hover:border-[#AC313F] hover:text-[#AC313F] transition-colors"
            >
              <span>View Inventory Levels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Counter Operational Guidelines */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-3.5 sm:p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <Clock className="w-3.5 h-3.5 text-[#666666]" />
              <span>Counter Shift Checklist</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#666666] leading-relaxed list-disc list-inside">
              <li>Open till float before accepting cash transactions.</li>
              <li>Verify customer phone password/PIN on repair intake.</li>
              <li>Reconcile card machine total before store closing.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
