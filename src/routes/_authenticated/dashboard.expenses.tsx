import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExpenses, saveExpense, voidExpense } from "@/lib/expenses.functions";
import { getOpenShift } from "@/lib/shifts.functions";
import { formatGBP } from "@/lib/utils";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ModalShell } from "@/components/ui/modal-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Loader2,
  Plus,
  Ban,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Calendar,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/expenses")({
  component: ExpensesPage,
});

const EXPENSE_CATEGORIES = [
  "Repair Parts Cost",
  "Wages / Staff Salary",
  "Shop Supplies / Utilities",
  "Food & Refreshments",
  "Courier & Postage",
  "Other Expenses",
];

const emptyExpense = {
  category: "Repair Parts Cost",
  description: "",
  amountPounds: "",
  expense_date: new Date().toISOString().split("T")[0],
};

function ExpensesPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listExpenses);
  const saveFn = useServerFn(saveExpense);
  const voidFn = useServerFn(voidExpense);
  const getOpenShiftFn = useServerFn(getOpenShift);

  const [page, setPage] = useState(0);
  const [form, setForm] = useState({ ...emptyExpense });
  const [submitting, setSubmitting] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedVoidId, setSelectedVoidId] = useState<string | null>(null);
  const [voidReasonText, setVoidReasonText] = useState("");
  const [voiding, setVoiding] = useState(false);

  const { data: openShift } = useQuery({
    queryKey: ["open-shift"],
    queryFn: () => getOpenShiftFn(),
    staleTime: 1000 * 15,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => listFn({ data: { include_void: true, page, limit: 30 } }),
    staleTime: 1000 * 30,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountPence = Math.round(parseFloat(form.amountPounds) * 100);
    if (isNaN(amountPence) || amountPence <= 0) {
      toastError("Please enter a valid expense amount greater than £0.00");
      return;
    }
    if (!form.description.trim()) {
      toastError("Please enter an expense description or payee");
      return;
    }

    setSubmitting(true);
    try {
      await saveFn({
        data: {
          category: form.category.trim(),
          description: form.description.trim(),
          amount_pence: amountPence,
          expense_date: form.expense_date,
          shift_id: openShift?.id ?? null,
        },
      });
      toastSuccess(`Expense of ${formatGBP(amountPence / 100)} recorded`);
      setForm({ ...emptyExpense, expense_date: form.expense_date });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch (err: unknown) {
      toastError(err, "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  }

  const handleOpenVoidPrompt = (id: string) => {
    setSelectedVoidId(id);
    setVoidReasonText("");
    setVoidModalOpen(true);
  };

  async function handleConfirmVoid() {
    if (!selectedVoidId) return;
    if (!voidReasonText.trim()) {
      toastError("Please enter an audit reason for voiding this expense");
      return;
    }

    setVoiding(true);
    try {
      await voidFn({ data: { id: selectedVoidId, void_reason: voidReasonText.trim() } });
      toastSuccess("Expense marked as voided");
      setVoidModalOpen(false);
      setSelectedVoidId(null);
      setVoidReasonText("");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch (err: unknown) {
      toastError(err, "Failed to void expense");
    } finally {
      setVoiding(false);
    }
  }

  const rows = data?.rows ?? [];
  const totalCount = data?.total ?? 0;
  const activeTotalPence = rows
    .filter((r) => !r.is_void)
    .reduce((sum, r) => sum + (r.amount_pence ?? 0), 0);

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Operational Expense Ledger</h1>
            <PageHelpButton
              pageTitle="Expenses"
              pageKey="expenses"
              steps={[
                "Log business expenses for parts, staff wages, utilities, or supplies.",
                "Cash expenses during active shifts adjust the register drawer balance.",
                "Immutable audit record: expenses can be voided with reason, never deleted.",
                "All expenses feed directly into the authoritative Daily Closing and Reports.",
              ]}
              firstTimeTip="Tip: Use the category chips for rapid logging. Amount is displayed clearly for verification."
            />
          </div>
          <p className="db-page-subtitle">
            Immutable expense tracking: repair parts purchases, staff wages, utilities, and store outgoings.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-bold text-ink shadow-xs shrink-0 self-start sm:self-auto">
          <TrendingDown className="w-4 h-4 text-destructive" />
          <span>
            Active on Page: <strong className="text-destructive font-black font-mono">{formatGBP(activeTotalPence / 100)}</strong>
          </span>
        </div>
      </div>

      {/* Rapid Expense Entry Card (Section 14 & 15) */}
      <form onSubmit={handleSubmit} className="db-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Log Store Expense / Outgoing
            </h2>
          </div>
          {openShift && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Linked to Active Shift Till
            </span>
          )}
        </div>

        {/* Quick Category Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Quick Category Selector:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                  form.category === cat
                    ? "bg-brand text-white border-brand shadow-xs"
                    : "bg-white text-foreground border-border hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-1">
          {/* Category Input */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Category <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Repair Parts Cost"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="db-input text-xs font-semibold"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Description / Payee / Reference <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. iPhone 14 Pro OLED screen part, Staff wage"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="db-input text-xs"
            />
          </div>

          {/* Amount: Visually dominant per Section 14 */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Amount (£) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                £
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                value={form.amountPounds}
                onChange={(e) => setForm({ ...form, amountPounds: e.target.value })}
                className="db-input !pl-8 text-base font-extrabold tabular-nums"
              />
            </div>
          </div>

          {/* Date */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Expense Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              required
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              className="db-input text-xs font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="submit"
            disabled={submitting || !form.description.trim() || !form.amountPounds}
            className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Expense…</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Standardized Dense Table */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Receipt className="w-6 h-6 text-brand" />}
              title="No expenses logged"
              description="Use the rapid entry form above to record store expenses and parts costs."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[700px]">
              <thead>
                <tr>
                  <th className="db-th">Date</th>
                  <th className="db-th">Category</th>
                  <th className="db-th">Description / Payee</th>
                  <th className="db-th text-right">Amount (£)</th>
                  <th className="db-th">Status</th>
                  <th className="db-th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const isVoid = Boolean(e.is_void);
                  return (
                    <tr
                      key={e.id}
                      className={isVoid ? "opacity-60 bg-muted/20" : "db-tr-hover"}
                    >
                      <td className="db-td font-mono text-muted-foreground whitespace-nowrap text-xs">
                        {e.expense_date}
                      </td>
                      <td className="db-td whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand/10 text-brand border border-brand/20">
                          {e.category}
                        </span>
                      </td>
                      <td className="db-td font-medium text-foreground">
                        <span className={isVoid ? "line-through text-muted-foreground" : ""}>
                          {e.description}
                        </span>
                        {isVoid && e.void_reason && (
                          <span className="block text-[10px] text-destructive italic mt-0.5">
                            Reason: {e.void_reason}
                          </span>
                        )}
                      </td>
                      <td
                        className={`db-td text-right font-extrabold font-mono tabular-nums text-sm whitespace-nowrap ${
                          isVoid ? "line-through text-muted-foreground" : "text-destructive"
                        }`}
                      >
                        {formatGBP((e.amount_pence ?? 0) / 100)}
                      </td>
                      <td className="db-td whitespace-nowrap">
                        <StatusBadge
                          status={isVoid ? "voided" : "paid"}
                          label={isVoid ? "Voided" : "Recorded"}
                          size="sm"
                          dot
                        />
                      </td>
                      <td className="db-td text-right whitespace-nowrap">
                        {!isVoid ? (
                          <button
                            type="button"
                            onClick={() => handleOpenVoidPrompt(e.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors cursor-pointer"
                            title="Void this expense (immutable audit record)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Void</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic px-2 py-1">
                            Voided
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

        {/* Pagination */}
        {totalCount > 30 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>
              Showing {page * 30 + 1}–{Math.min((page + 1) * 30, totalCount)} of {totalCount} expenses
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
                Page {page + 1} of {Math.ceil(totalCount / 30)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * 30 >= totalCount}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Void Reason Modal (Section 15 & 26: ModalShell) */}
      <ModalShell
        open={voidModalOpen}
        onOpenChange={setVoidModalOpen}
        title="Void Operational Expense"
        description="Expenses cannot be hard deleted. Please state the audit reason for voiding this record."
        icon={AlertTriangle}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setVoidModalOpen(false)}
              className="btn-outline !py-2 !px-4 !text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={voiding || !voidReasonText.trim()}
              onClick={handleConfirmVoid}
              className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {voiding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Voiding…</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Void Record</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-bold text-foreground">
            Audit Reason for Voiding <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Duplicate entry, refunded by parts vendor"
            value={voidReasonText}
            onChange={(e) => setVoidReasonText(e.target.value)}
            className="db-input text-xs"
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            This reason will be attached to the audit trail and displayed in financial reporting.
          </p>
        </div>
      </ModalShell>
    </div>
  );
}
