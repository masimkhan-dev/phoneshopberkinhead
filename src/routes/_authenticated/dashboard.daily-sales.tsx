import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listDailySales,
  getDailySaleByDate,
  saveDailySale,
  voidDailySale,
  listDailyExpensesByDate,
  addDailyExpense,
  deleteDailyExpense,
} from "@/lib/daily-sales.functions";
import { getOpenShift } from "@/lib/shifts.functions";
import { useAuth } from "@/lib/auth-context";
import { formatGBP } from "@/lib/utils";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  CalendarCheck,
  Banknote,
  CreditCard,
  Building2,
  Calculator,
  Loader2,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Ban,
  RotateCcw,
  Receipt,
  Plus,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/daily-sales")({
  component: DailySalesPage,
});

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const EXPENSE_CATEGORIES = [
  "Repair Parts Cost",
  "Wages / Staff Salary",
  "Shop Supplies / Utilities",
  "Food & Refreshments",
  "Courier & Postage",
  "Other Expenses",
];

function DailySalesPage() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const todayStr = getTodayString();

  const listFn = useServerFn(listDailySales);
  const getByDateFn = useServerFn(getDailySaleByDate);
  const saveFn = useServerFn(saveDailySale);
  const voidFn = useServerFn(voidDailySale);
  const getOpenShiftFn = useServerFn(getOpenShift);

  const listExpensesFn = useServerFn(listDailyExpensesByDate);
  const addExpenseFn = useServerFn(addDailyExpense);
  const deleteExpenseFn = useServerFn(deleteDailyExpense);

  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voidPromptId, setVoidPromptId] = useState<string | null>(null);
  const [voidReasonText, setVoidReasonText] = useState("");
  const [voiding, setVoiding] = useState(false);

  // Daily Sales Form state
  const [entryDate, setEntryDate] = useState(todayStr);
  const [staffName, setStaffName] = useState("");
  const [cashAmountStr, setCashAmountStr] = useState("");
  const [cardAmountStr, setCardAmountStr] = useState("");
  const [bankAmountStr, setBankAmountStr] = useState("");
  const [notes, setNotes] = useState("");

  // Cash Drawer Reconciliation & Float state
  const [openingFloatStr, setOpeningFloatStr] = useState("100.00");
  const [actualDrawerCashStr, setActualDrawerCashStr] = useState("");
  const [showDrawerCalculator, setShowDrawerCalculator] = useState(true);

  // Daily Expense Entry inline state
  const [expenseCategory, setExpenseCategory] = useState("Repair Parts Cost");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmountStr, setExpenseAmountStr] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  // Default staff name from logged in user email / name
  useEffect(() => {
    if (!staffName && user?.email) {
      const defaultName = user.email.split("@")[0].replace(/[._]/g, " ");
      setStaffName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
    }
  }, [user, staffName]);

  // Fetch list of daily entries (enriched with expenses and net)
  const { data: salesList, isLoading } = useQuery({
    queryKey: ["daily-sales-list", page],
    queryFn: () => listFn({ data: { page, limit: 30 } }),
    staleTime: 1000 * 30,
  });

  // Fetch today's entry to check if already recorded
  const { data: todayEntry, isLoading: isTodayLoading } = useQuery({
    queryKey: ["daily-sale-today", todayStr],
    queryFn: () => getByDateFn({ data: { date: todayStr } }),
    staleTime: 1000 * 30,
  });

  // Fetch active shift to integrate opening float
  const { data: activeShift } = useQuery({
    queryKey: ["active-shift-daily-sales"],
    queryFn: () => getOpenShiftFn(),
    staleTime: 1000 * 30,
  });

  // Prepopulate float from active shift if available
  useEffect(() => {
    if (activeShift?.opening_float_pence != null) {
      setOpeningFloatStr((activeShift.opening_float_pence / 100).toFixed(2));
    }
  }, [activeShift]);

  // Fetch expenses recorded for the current selected closing date
  const { data: dateExpenses = [] } = useQuery({
    queryKey: ["daily-expenses", entryDate],
    queryFn: () => listExpensesFn({ data: { date: entryDate } }),
    staleTime: 1000 * 15,
  });

  // Calculate live dynamic numbers
  const cashNum = parseFloat(cashAmountStr) || 0;
  const cardNum = parseFloat(cardAmountStr) || 0;
  const bankNum = parseFloat(bankAmountStr) || 0;
  const liveTotalSales = Math.round((cashNum + cardNum + bankNum) * 100) / 100;

  const totalDayExpenses = (dateExpenses ?? []).reduce(
    (sum, exp) => sum + (exp.amount_pence || 0) / 100,
    0,
  );
  const liveNet = Math.round((liveTotalSales - totalDayExpenses) * 100) / 100;

  // Drawer Reconciliation Calculations
  const openingFloatNum = parseFloat(openingFloatStr) || 0;
  // Expected physical drawer cash = Opening float + Cash sales - Cash expenses
  const expectedDrawerCash = Math.round((openingFloatNum + cashNum - totalDayExpenses) * 100) / 100;
  const actualDrawerCashNum = actualDrawerCashStr !== "" ? parseFloat(actualDrawerCashStr) || 0 : null;
  const drawerVariance = actualDrawerCashNum !== null
    ? Math.round((actualDrawerCashNum - expectedDrawerCash) * 100) / 100
    : null;

  // Handle editing an existing record
  function handleStartEdit(row: {
    id: string;
    entry_date: string;
    staff_name: string;
    cash_amount: number;
    card_amount: number;
    bank_amount: number;
    notes: string | null;
  }) {
    setEditingId(row.id);
    setIsEditingUnlocked(true);
    setEntryDate(row.entry_date);
    setStaffName(row.staff_name);
    setCashAmountStr(row.cash_amount > 0 ? String(row.cash_amount) : "");
    setCardAmountStr(row.card_amount > 0 ? String(row.card_amount) : "");
    setBankAmountStr(row.bank_amount > 0 ? String(row.bank_amount) : "");
    setNotes(row.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleResetForm() {
    setEditingId(null);
    setIsEditingUnlocked(false);
    setEntryDate(todayStr);
    setCashAmountStr("");
    setCardAmountStr("");
    setBankAmountStr("");
    setActualDrawerCashStr("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!staffName.trim()) {
      toastError("Please provide the Staff Name");
      return;
    }

    if (liveTotalSales <= 0) {
      toastError("Total sales must be greater than £0.00. Please enter cash, card, or bank amounts.");
      return;
    }

    // If actual drawer cash was verified and had discrepancy, append it to notes if not already noted
    let finalNotes = notes.trim();
    if (drawerVariance !== null && drawerVariance !== 0) {
      const varianceLabel = drawerVariance > 0
        ? `[Cash Drawer Over: +${formatGBP(drawerVariance)}]`
        : `[Cash Drawer Short: ${formatGBP(drawerVariance)}]`;
      if (!finalNotes.includes(varianceLabel)) {
        finalNotes = finalNotes ? `${finalNotes} ${varianceLabel}` : varianceLabel;
      }
    }

    setSubmitting(true);
    try {
      await saveFn({
        data: {
          id: editingId ?? undefined,
          entry_date: entryDate,
          staff_name: staffName.trim(),
          cash_amount: Math.max(0, cashNum),
          card_amount: Math.max(0, cardNum),
          bank_amount: Math.max(0, bankNum),
          notes: finalNotes || null,
        },
      });

      toastSuccess(
        editingId ? "Daily sales closing updated successfully" : "Daily sales closing recorded successfully",
      );
      handleResetForm();
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sale-today"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (err: unknown) {
      toastError(err, "Failed to save daily sales entry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoid(id: string) {
    if (!voidReasonText.trim()) {
      toastError("Please enter a reason for voiding this daily sales closing");
      return;
    }

    setVoiding(true);
    try {
      await voidFn({ data: { id, void_reason: voidReasonText.trim() } });
      toastSuccess("Daily closing entry voided");
      setVoidPromptId(null);
      setVoidReasonText("");
      if (editingId === id) handleResetForm();
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sale-today"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (err: unknown) {
      toastError(err, "Failed to void daily closing entry");
    } finally {
      setVoiding(false);
    }
  }

  // Handle adding an expense for the selected closing date
  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(expenseAmountStr);
    if (isNaN(amt) || amt <= 0) {
      toastError("Please enter a valid expense amount greater than £0.00");
      return;
    }
    if (!expenseDesc.trim()) {
      toastError("Please enter an expense description (e.g. Screen part, Wages, Supplies)");
      return;
    }

    setAddingExpense(true);
    try {
      await addExpenseFn({
        data: {
          expense_date: entryDate,
          category: expenseCategory.trim(),
          description: expenseDesc.trim(),
          amount: amt,
        },
      });
      toastSuccess(`Expense of ${formatGBP(amt)} recorded for ${entryDate}`);
      setExpenseDesc("");
      setExpenseAmountStr("");
      queryClient.invalidateQueries({ queryKey: ["daily-expenses", entryDate] });
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err: unknown) {
      toastError(err, "Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      await deleteExpenseFn({ data: { id } });
      toastSuccess("Expense removed");
      queryClient.invalidateQueries({ queryKey: ["daily-expenses", entryDate] });
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err: unknown) {
      toastError(err, "Failed to remove expense");
    }
  }

  const rows = salesList?.rows ?? [];
  const totalEntries = salesList?.total ?? 0;

  // Aggregate totals for displayed table page (active non-void only)
  const activeRows = rows.filter((r) => !r.is_void);
  const pageCashTotal = activeRows.reduce((s, r) => s + Number(r.cash_amount || 0), 0);
  const pageCardTotal = activeRows.reduce((s, r) => s + Number(r.card_amount || 0), 0);
  const pageBankTotal = activeRows.reduce((s, r) => s + Number(r.bank_amount || 0), 0);
  const pageSalesGrandTotal = activeRows.reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const pageExpensesTotal = activeRows.reduce((s, r) => s + (Number(r.expenses_amount) || 0), 0);
  const pageNetTotal = activeRows.reduce((s, r) => s + (Number(r.net_amount) || 0), 0);

  // Determine if today is already closed and locked
  const isTodayClosedAndLocked = Boolean(todayEntry) && !isEditingUnlocked;

  return (
    <div className="db-page space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Daily Sales &amp; Reconciliation</h1>
            <PageHelpButton
              pageTitle="Daily Sales & Reconciliation"
              pageKey="daily-sales"
              steps={[
                "Enter end-of-day register totals: Cash, Card, and Bank Wire.",
                "Review opening float and verify expected drawer cash vs counted cash.",
                "Record daily store expenses (parts, wages, supplies) to compute net cashflow.",
                "When verified, submit the closing to lock today's ledger.",
                "Reports and accountant exports consume these authoritative records.",
              ]}
              firstTimeTip="Tip: Enter cash, card and bank figures. The drawer reconciliation calculator verifies expected vs physical cash."
            />
          </div>
          <p className="db-page-subtitle">
            Financial control centre: register reconciliation, float audit, expense deductions, and official day closing.
          </p>
        </div>

        {/* Date & Shift Context Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {activeShift ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Open (Float: {formatGBP(activeShift.opening_float_pence / 100)})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-semibold text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Register Idle</span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-foreground shadow-xs">
            <CalendarCheck className="w-3.5 h-3.5 text-brand" />
            <span>Today: {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Reconciled & Locked Today State (Section 6 requirement) */}
      {isTodayClosedAndLocked && todayEntry && (
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-ink">
                    Trading Day {todayEntry.entry_date} Reconciled &amp; Closed
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Locked Record
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Closed by <strong className="text-ink">{todayEntry.staff_name}</strong>. Historical financial figures are authoritative.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartEdit(todayEntry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-muted border border-border text-ink font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-brand" />
              <span>Unlock to Edit Closing</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Cash Sales
              </span>
              <span className="text-lg font-black text-ink tabular-nums">
                {formatGBP(Number(todayEntry.cash_amount))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Card Terminals
              </span>
              <span className="text-lg font-black text-ink tabular-nums">
                {formatGBP(Number(todayEntry.card_amount))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Bank Wire
              </span>
              <span className="text-lg font-black text-ink tabular-nums">
                {formatGBP(Number(todayEntry.bank_amount))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-brand/5 border border-brand/20">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand block">
                Total Takings
              </span>
              <span className="text-lg font-black text-brand tabular-nums">
                {formatGBP(Number(todayEntry.total_amount))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                Reconciled Status
              </span>
              <span className="text-sm font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> Ready for Audit
              </span>
            </div>
          </div>

          {todayEntry.notes && (
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
              <strong className="text-foreground">Closing Notes:</strong> {todayEntry.notes}
            </div>
          )}
        </div>
      )}

      {/* Main Closing Workflow Form (shown when not locked or when unlocked for edit) */}
      {(!isTodayClosedAndLocked || isEditingUnlocked) && (
        <div className="db-card p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand" />
              <h2 className="text-base font-extrabold text-foreground">
                {editingId ? "Edit / Re-reconcile Daily Closing" : "Daily Register Closing & Reconciliation"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Cancel &amp; Re-lock
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Date & Staff Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Trading Closing Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="db-input font-medium"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Financial date for which cash drawer and card receipts were collected.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Responsible Staff Member <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman, Alex"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="db-input font-medium"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Staff member signing off the drawer count and card totals.
                </p>
              </div>
            </div>

            {/* Step 2: Core 3 Sales Ingestion Inputs */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>1. Sales &amp; Takings Breakdown</span>
                <span className="text-brand font-bold text-[10px] normal-case bg-brand/10 px-2 py-0.5 rounded-md">
                  Authoritative Register Breakdown
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cash Sales */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 hover:border-brand/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash Sales</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                      Till Takings
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={cashAmountStr}
                      onChange={(e) => setCashAmountStr(e.target.value)}
                      className="db-input !pl-8 text-base font-extrabold tabular-nums"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Total cash received from customer purchases &amp; repairs.
                  </p>
                </div>

                {/* Card Sales */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 hover:border-brand/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Card Terminal</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                      POS Settlement
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={cardAmountStr}
                      onChange={(e) => setCardAmountStr(e.target.value)}
                      className="db-input !pl-8 text-base font-extrabold tabular-nums"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Sum from card terminal end-of-day X / Z report.
                  </p>
                </div>

                {/* Bank Wire */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 hover:border-brand/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>Bank Wire / Direct</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                      Direct BACS
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={bankAmountStr}
                      onChange={(e) => setBankAmountStr(e.target.value)}
                      className="db-input !pl-8 text-base font-extrabold tabular-nums"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Direct bank transfers verified in business bank account.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Cash Drawer Reconciliation & Variance Control (Section 5-7) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    2. Cash Drawer Reconciliation &amp; Float Audit
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDrawerCalculator(!showDrawerCalculator)}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  {showDrawerCalculator ? "Collapse Drawer Audit" : "Show Drawer Audit"}
                </button>
              </div>

              {showDrawerCalculator && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Opening Float */}
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Opening Till Float (£)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                          £
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="100.00"
                          value={openingFloatStr}
                          onChange={(e) => setOpeningFloatStr(e.target.value)}
                          className="db-input !pl-7 text-xs font-bold tabular-nums"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Physical float starting in drawer before trade.
                      </p>
                    </div>

                    {/* Expected Drawer Total */}
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Expected Till Cash (£)
                      </label>
                      <div className="px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm font-black text-ink tabular-nums flex items-center justify-between">
                        <span>{formatGBP(expectedDrawerCash)}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Float + Cash - Expenses
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {formatGBP(openingFloatNum)} + {formatGBP(cashNum)} − {formatGBP(totalDayExpenses)}
                      </p>
                    </div>

                    {/* Actual Counted Physical Cash */}
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Actual Counted Cash in Drawer (£)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                          £
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g. physical count"
                          value={actualDrawerCashStr}
                          onChange={(e) => setActualDrawerCashStr(e.target.value)}
                          className="db-input !pl-7 text-xs font-black tabular-nums"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Count notes &amp; coins physically in register.
                      </p>
                    </div>
                  </div>

                  {/* Variance Readout (Section 7: impossible to miss) */}
                  {actualDrawerCashNum !== null && (
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        drawerVariance === 0
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : drawerVariance! < 0
                          ? "bg-destructive/10 border-destructive/30 text-destructive"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {drawerVariance === 0 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : drawerVariance! < 0 ? (
                          <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-extrabold text-sm">
                            {drawerVariance === 0
                              ? "Till Balanced: Exact Match (£0.00 Variance)"
                              : drawerVariance! < 0
                              ? `Till Short: Discrepancy of ${formatGBP(Math.abs(drawerVariance!))} Less Than Expected`
                              : `Till Over: Discrepancy of +${formatGBP(drawerVariance!)} Higher Than Expected`}
                          </div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            Expected: {formatGBP(expectedDrawerCash)} · Physical Count: {formatGBP(actualDrawerCashNum)} · Variance: {formatGBP(drawerVariance!)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 font-mono font-black text-sm">
                        {drawerVariance === 0 ? "Balanced" : formatGBP(drawerVariance!)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 4: Daily Expenses & Outgoings Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    3. Today&apos;s Store Expenses &amp; Outgoings for {entryDate}
                  </h3>
                </div>
                <span className="text-xs font-bold text-destructive tabular-nums">
                  Total Expenses Deducted: {formatGBP(totalDayExpenses)}
                </span>
              </div>

              {/* Quick Category Selector Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Quick Category Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setExpenseCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        expenseCategory === cat
                          ? "bg-brand text-white border-brand shadow-xs"
                          : "bg-white text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Inline Add Expense Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Category (e.g. Repair Parts Cost, Wages)"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="db-input text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Description (e.g. iPhone 13 OLED screen, Staff meal)"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="db-input text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-2 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={expenseAmountStr}
                    onChange={(e) => setExpenseAmountStr(e.target.value)}
                    className="db-input !pl-6 text-xs font-extrabold tabular-nums"
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="button"
                    disabled={addingExpense || !expenseDesc.trim() || !expenseAmountStr}
                    onClick={handleAddExpense}
                    className="w-full h-full min-h-[36px] rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                    title="Add this expense to today's closing"
                  >
                    {addingExpense ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span className="sm:hidden">Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Itemized Expenses List */}
              {dateExpenses.length > 0 ? (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Recorded Expenses for {entryDate}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dateExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2.5 rounded-xl bg-white border border-border flex items-center justify-between text-xs gap-2"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-brand/10 text-brand font-bold text-[10px]">
                              {exp.category}
                            </span>
                            <span className="font-bold text-foreground truncate">
                              {exp.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-black text-destructive">
                            {formatGBP((exp.amount_pence || 0) / 100)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Remove expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic pt-1">
                  No expenses recorded for this trading date. Log parts costs, wages, or shop supplies above if applicable.
                </p>
              )}
            </div>

            {/* Step 5: Notes & Discrepancy Comments */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Closing Notes &amp; Audit Comments (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Saturday closing, high screen repair volume, variance explained"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="db-input text-xs"
              />
            </div>

            {/* Step 6: Final Dynamic Summary & Close Submission */}
            <div className="p-5 rounded-2xl bg-white border-2 border-brand/30 shadow-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
              <div className="space-y-2 w-full xl:w-auto">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-brand" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                    Authoritative Closing Computation
                  </span>
                </div>

                {/* 3-Part Live Calculation Display */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                      Total Takings
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-brand tabular-nums">
                      {formatGBP(liveTotalSales)}
                    </span>
                  </div>

                  <span className="text-xl font-bold text-muted-foreground sm:pt-4">−</span>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                      Day Expenses
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-destructive tabular-nums">
                      {formatGBP(totalDayExpenses)}
                    </span>
                  </div>

                  <span className="text-xl font-bold text-muted-foreground sm:pt-4">=</span>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                      Net Cashflow
                    </span>
                    <span
                      className={`text-2xl sm:text-3xl font-black tabular-nums ${
                        liveNet >= 0 ? "text-emerald-700" : "text-destructive"
                      }`}
                    >
                      {formatGBP(liveNet)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-mono">
                  Cash: {formatGBP(cashNum)} + Card: {formatGBP(cardNum)} + Bank: {formatGBP(bankNum)}
                  {totalDayExpenses > 0 && ` | Less ${formatGBP(totalDayExpenses)} expenses`}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || liveTotalSales <= 0}
                className="w-full xl:w-auto px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Closing...</span>
                  </>
                ) : editingId ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    <span>Update &amp; Lock Closing</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalize Daily Sales Closing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary KPI Cards of Current Historical View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Cash Takings", value: formatGBP(pageCashTotal), icon: Banknote, color: "text-emerald-700" },
          { label: "Card Takings", value: formatGBP(pageCardTotal), icon: CreditCard, color: "text-blue-700" },
          { label: "Bank Transfers", value: formatGBP(pageBankTotal), icon: Building2, color: "text-purple-700" },
          { label: "Total Sales", value: formatGBP(pageSalesGrandTotal), icon: Calculator, color: "text-brand" },
          { label: "Day Expenses", value: formatGBP(pageExpensesTotal), icon: Receipt, color: "text-destructive" },
          {
            label: "Net Cashflow",
            value: formatGBP(pageNetTotal),
            icon: TrendingUp,
            color: pageNetTotal >= 0 ? "text-emerald-700" : "text-destructive",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="db-card p-3.5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-wider">{kpi.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className={`text-lg font-extrabold tabular-nums tracking-tight truncate ${kpi.color}`}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">In recent records</div>
            </div>
          );
        })}
      </div>

      {/* Historical Daily Sales Entries Table */}
      <div className="db-card !p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="db-card-title">Daily Sales Closing History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authoritative daily turnover and net profit records ({totalEntries} total entries recorded).
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={9} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<CalendarCheck className="w-6 h-6 text-brand" />}
              title="No daily sales recorded yet"
              description="Enter today's cash, card, and bank takings above to record the first closing."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[750px]">
              <thead>
                <tr>
                  <th className="db-th">Date</th>
                  <th className="db-th">Staff</th>
                  <th className="db-th text-right">Cash</th>
                  <th className="db-th text-right">Card</th>
                  <th className="db-th text-right">Bank Transfer</th>
                  <th className="db-th text-right text-brand">Total Sales</th>
                  <th className="db-th text-right text-destructive">Expenses</th>
                  <th className="db-th text-right">Net Cashflow</th>
                  <th className="db-th">Notes</th>
                  <th className="db-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isVoid = Boolean(row.is_void);
                  return (
                    <tr
                      key={row.id}
                      className={isVoid ? "opacity-60 bg-muted/20" : "db-tr-hover"}
                    >
                      <td className="db-td font-extrabold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.entry_date}</span>
                          {isVoid && (
                            <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-black uppercase tracking-wider">
                              VOIDED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="db-td font-semibold text-muted-foreground whitespace-nowrap">
                        {row.staff_name}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {formatGBP(Number(row.cash_amount))}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {formatGBP(Number(row.card_amount))}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {formatGBP(Number(row.bank_amount))}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid ? "line-through text-muted-foreground font-semibold" : "font-black text-brand"
                        }`}
                      >
                        {formatGBP(Number(row.total_amount))}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid ? "line-through text-muted-foreground" : "font-bold text-destructive"
                        }`}
                      >
                        {formatGBP(Number(row.expenses_amount || 0))}
                      </td>
                      <td
                        className={`db-td text-right font-mono tabular-nums ${
                          isVoid
                            ? "text-muted-foreground italic font-normal text-xs"
                            : Number(row.net_amount || 0) >= 0
                            ? "font-black text-emerald-700"
                            : "font-black text-destructive"
                        }`}
                      >
                        {isVoid ? "Voided (£0.00)" : formatGBP(Number(row.net_amount || 0))}
                      </td>
                      <td className="db-td text-xs text-muted-foreground max-w-xs truncate">
                        {isVoid ? (
                          <span className="text-destructive font-medium">
                            Voided: {row.void_reason || "No reason given"}
                          </span>
                        ) : (
                          row.notes || "—"
                        )}
                      </td>
                      <td className="db-td text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isVoid ? (
                            <span className="text-[11px] text-muted-foreground italic px-2 py-1">
                              Record voided
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(row)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Edit this entry"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {role === "admin" && (
                                <>
                                  {voidPromptId === row.id ? (
                                    <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-1 rounded-lg text-xs">
                                      <input
                                        type="text"
                                        placeholder="Reason for voiding..."
                                        value={voidReasonText}
                                        onChange={(e) => setVoidReasonText(e.target.value)}
                                        className="px-2 py-0.5 text-[11px] rounded bg-white border border-border outline-none min-w-[140px]"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        disabled={voiding || !voidReasonText.trim()}
                                        onClick={() => handleVoid(row.id)}
                                        className="px-2 py-0.5 bg-destructive hover:bg-destructive/90 text-white rounded text-[10px] font-bold disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                      >
                                        {voiding ? "..." : "Void"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVoidPromptId(null);
                                          setVoidReasonText("");
                                        }}
                                        className="text-[10px] text-muted-foreground hover:underline cursor-pointer px-1"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVoidPromptId(row.id);
                                        setVoidReasonText("");
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                      title="Void this daily sales entry"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalEntries > 30 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Showing {page * 30 + 1}–{Math.min((page + 1) * 30, totalEntries)} of {totalEntries} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded-lg border border-border disabled:opacity-50 text-foreground font-semibold cursor-pointer hover:bg-muted"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={(page + 1) * 30 >= totalEntries}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-border disabled:opacity-50 text-foreground font-semibold cursor-pointer hover:bg-muted"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
