import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllActiveProducts } from "@/lib/products.functions";
import { searchCustomers } from "@/lib/customers.functions";
import { completeSale } from "@/lib/sales.functions";
import { getOpenShift } from "@/lib/shifts.functions";
import { formatGBP } from "@/lib/utils";
import {
  Loader2,
  Trash2,
  ShoppingCart,
  Search,
  Minus,
  Plus,
  CreditCard,
  Banknote,
  Building2,
  AlertTriangle,
  Barcode,
  X,
  User,
  UserCheck,
  Tag,
  History,
  Lock,
  Unlock,
  Zap,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { toast } from "sonner";
import { toastSuccess, toastError, toastWarning } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import type { InvoiceData } from "@/components/dashboard/Invoice";
import type { ReconciliationData } from "@/components/dashboard/ShiftModals";

import { InvoiceModal } from "@/components/dashboard/Invoice";
import { RepairA4InvoiceModal } from "@/components/dashboard/RepairA4InvoiceModal";
import { CreateRepairInvoiceModal } from "@/components/dashboard/CreateRepairInvoiceModal";
const OpenShiftModal = lazy(() =>
  import("@/components/dashboard/ShiftModals").then((m) => ({ default: m.OpenShiftModal })),
);
const CloseShiftModal = lazy(() =>
  import("@/components/dashboard/ShiftModals").then((m) => ({ default: m.CloseShiftModal })),
);
const ShiftReconciliationResultModal = lazy(() =>
  import("@/components/dashboard/ShiftModals").then((m) => ({
    default: m.ShiftReconciliationResultModal,
  })),
);
const ShiftHistoryModal = lazy(() =>
  import("@/components/dashboard/ShiftModals").then((m) => ({ default: m.ShiftHistoryModal })),
);

export const Route = createFileRoute("/_authenticated/dashboard/pos")({
  component: POSPage,
});

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_pence: number;
  original_price_pence: number;
  discount_pence: number;
  line_total_pence: number;
  stock: number;
}

type DiscountMode = "none" | "student_10" | "custom";

interface DiscountPresetOption {
  id: DiscountMode;
  label: string;
  rate?: number;
  receiptLabel?: string;
}

const DISCOUNT_PRESETS: DiscountPresetOption[] = [
  { id: "none", label: "None" },
  { id: "student_10", label: "Student 10%", rate: 0.1, receiptLabel: "Student Discount 10%" },
  { id: "custom", label: "Custom" },
];

function POSPage() {
  const queryClient = useQueryClient();
  const listProductsFn = useServerFn(listAllActiveProducts);
  const searchCustomersFn = useServerFn(searchCustomers);
  const completeSaleFn = useServerFn(completeSale);
  const getOpenShiftFn = useServerFn(getOpenShift);

  // Active products query
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["active-products"],
    queryFn: () => listProductsFn(),
  });

  // Open shift query
  const { data: openShift } = useQuery({
    queryKey: ["open-shift"],
    queryFn: () => getOpenShiftFn(),
  });

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [discountMode, setDiscountMode] = useState<DiscountMode>("none");
  const [customDiscountPounds, setCustomDiscountPounds] = useState<number>(0);
  const [amountTenderedPounds, setAmountTenderedPounds] = useState<string>("");
  const [payments, setPayments] = useState<Array<{
    id: string;
    method: "cash" | "card" | "bank_transfer";
    amountPence: number;
  }>>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addPaymentMethod, setAddPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [addPaymentPounds, setAddPaymentPounds] = useState<string>("");
  const [cashReceivedPounds, setCashReceivedPounds] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Quick Repair Invoice Modal state
  const [showCreateRepairModal, setShowCreateRepairModal] = useState(false);
  const [quickRepairInvoice, setQuickRepairInvoice] = useState<any | null>(null);

  // Shift Modal states
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showShiftHistoryModal, setShowShiftHistoryModal] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationData | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Derived category list
  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) cats.add(p.category.trim());
    });
    return ["All", ...Array.from(cats).sort()];
  }, [products]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const isService = p.type === "service";
      const isOutOfStock = !isService && p.stock_quantity <= 0;
      if (hideOutOfStock && isOutOfStock) return false;

      const matchesCategory =
        selectedCategory === "All" || p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!q) return matchesCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, query, selectedCategory, hideOutOfStock]);

  function addToCart(product: {
    id: string;
    name: string;
    sale_price_pence: number;
    stock_quantity: number;
    type?: string;
  }) {
    const isService = product.type === "service";

    if (!isService && product.stock_quantity <= 0) {
      toast.error(`"${product.name}" is out of stock`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        if (!isService && existing.quantity >= product.stock_quantity) {
          toast.error(`Cannot add more than ${product.stock_quantity} available units`);
          return prev;
        }
        return prev.map((c) =>
          c.product_id === product.id
            ? {
              ...c,
              quantity: c.quantity + 1,
              line_total_pence: (c.quantity + 1) * c.unit_price_pence - c.discount_pence,
            }
            : c,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price_pence: product.sale_price_pence,
          original_price_pence: product.sale_price_pence,
          discount_pence: 0,
          line_total_pence: product.sale_price_pence,
          stock: product.stock_quantity,
        },
      ];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.product_id !== id) return c;
          const newQty = Math.min(Math.max(c.quantity + delta, 0), c.stock);
          const lineTotal = newQty * c.unit_price_pence - c.discount_pence;
          return { ...c, quantity: newQty, line_total_pence: Math.max(lineTotal, 0) };
        })
        .filter((c) => c.quantity > 0),
    );
  }

  function updateQty(id: string, targetQty: number) {
    setCart((prev) =>
      prev.map((c) => {
        if (c.product_id !== id) return c;
        if (targetQty > c.stock) {
          toast.error(`Only ${c.stock} units available in stock`);
        }
        const validQty = Math.min(Math.max(targetQty, 0), c.stock);
        const lineTotal = validQty * c.unit_price_pence - c.discount_pence;
        return { ...c, quantity: validQty, line_total_pence: Math.max(lineTotal, 0) };
      }),
    );
  }

  function updateUnitPrice(id: string, newUnitPricePounds: number) {
    setCart((prev) =>
      prev.map((c) => {
        if (c.product_id !== id) return c;
        const validPounds = Math.max(newUnitPricePounds, 0);
        const newPence = Math.round(validPounds * 100);
        const lineTotal = c.quantity * newPence - c.discount_pence;
        return {
          ...c,
          unit_price_pence: newPence,
          line_total_pence: Math.max(lineTotal, 0),
        };
      }),
    );
  }

  function resetUnitPrice(id: string) {
    setCart((prev) =>
      prev.map((c) => {
        if (c.product_id !== id) return c;
        const lineTotal = c.quantity * c.original_price_pence - c.discount_pence;
        return {
          ...c,
          unit_price_pence: c.original_price_pence,
          line_total_pence: Math.max(lineTotal, 0),
        };
      }),
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.product_id !== id));
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const rawQuery = query.trim();
      if (!rawQuery) return;

      const normQuery = rawQuery.toLowerCase();
      const allProds = products || [];

      // 1. Exact Manufacturer Barcode match
      let matched = allProds.find((p) => p.barcode && p.barcode.trim().toLowerCase() === normQuery);

      // 2. Exact Internal SKU match
      if (!matched) {
        matched = allProds.find((p) => p.sku && p.sku.trim().toLowerCase() === normQuery);
      }

      // 3. Fallback: first candidate in filtered list
      if (!matched && filteredProducts.length > 0) {
        matched = filteredProducts[0];
      }

      if (matched) {
        addToCart(matched);
        setQuery("");
        setTimeout(() => searchRef.current?.focus(), 10);
      } else if (filteredProducts.length === 0) {
        toast.error(`No product found for "${rawQuery}"`);
      }
    }
  }

  // All financial arithmetic in integer pence
  const subtotalPence = cart.reduce((acc, item) => acc + item.line_total_pence, 0);
  const activeDiscountPreset = DISCOUNT_PRESETS.find((p) => p.id === discountMode);

  const discountPence = useMemo(() => {
    if (discountMode === "none") return 0;
    if (discountMode === "custom") {
      return Math.min(Math.round(customDiscountPounds * 100), subtotalPence);
    }
    if (activeDiscountPreset?.rate) {
      return Math.min(Math.round(subtotalPence * activeDiscountPreset.rate), subtotalPence);
    }
    return 0;
  }, [discountMode, activeDiscountPreset, subtotalPence, customDiscountPounds]);

  const discountReceiptLabel = useMemo(() => {
    if (discountMode === "none" || discountPence <= 0) return null;
    if (activeDiscountPreset?.receiptLabel) return activeDiscountPreset.receiptLabel;
    if (discountMode === "custom") return "Discount";
    return "Discount";
  }, [discountMode, discountPence, activeDiscountPreset]);

  const totalPence = Math.max(subtotalPence - discountPence, 0);

  const totalPaidPence = payments.reduce((acc, p) => acc + p.amountPence, 0);
  const remainingPence = Math.max(totalPence - totalPaidPence, 0);

  const totalCashAllocatedPence = payments
    .filter((p) => p.method === "cash")
    .reduce((acc, p) => acc + p.amountPence, 0);
  const cashReceivedPence = cashReceivedPounds ? Math.round(parseFloat(cashReceivedPounds) * 100) : 0;
  const changePence =
    totalCashAllocatedPence > 0 && cashReceivedPence > totalCashAllocatedPence
      ? cashReceivedPence - totalCashAllocatedPence
      : 0;

  const hasCashPayment = payments.some((p) => p.method === "cash");
  const isCashSaleWithoutShift = hasCashPayment && !openShift;

  // Auto-sync single full payment when total changes
  useEffect(() => {
    if (cart.length === 0) {
      setPayments([]);
      setCashReceivedPounds("");
      return;
    }
    setPayments((prev) => {
      if (prev.length === 1 && totalPence > 0) {
        return [{ ...prev[0], amountPence: totalPence }];
      }
      return prev;
    });
  }, [totalPence, cart.length]);

  function addFullPayment(method: "cash" | "card" | "bank_transfer") {
    setPayments([
      {
        id: crypto.randomUUID(),
        method,
        amountPence: totalPence,
      },
    ]);
    setPaymentMethod(method);
    if (method === "cash") {
      setCashReceivedPounds((totalPence / 100).toFixed(2));
    } else {
      setCashReceivedPounds("");
    }
  }

  function removePayment(id: string) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function handleAddCustomPayment() {
    const amountNum = parseFloat(addPaymentPounds);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    const amountPence = Math.min(Math.round(amountNum * 100), remainingPence);
    if (amountPence <= 0) return;

    setPayments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        method: addPaymentMethod,
        amountPence,
      },
    ]);
    if (addPaymentMethod === "cash" && !cashReceivedPounds) {
      setCashReceivedPounds((amountPence / 100).toFixed(2));
    }
    setShowAddPayment(false);
    setAddPaymentPounds("");
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (remainingPence > 0) {
      toast.error(`Please allocate the remaining ${formatGBP(remainingPence / 100)} before completing the sale`);
      return;
    }
    if (isCashSaleWithoutShift) {
      toast.error("Please Open Till before completing a cash sale");
      setShowOpenShiftModal(true);
      return;
    }
    if (
      totalCashAllocatedPence > 0 &&
      cashReceivedPence > 0 &&
      cashReceivedPence < totalCashAllocatedPence
    ) {
      toast.error(
        `Cash received (${formatGBP(cashReceivedPence / 100)}) is less than cash due (${formatGBP(totalCashAllocatedPence / 100)})`,
      );
      return;
    }

    setSubmitting(true);
    const idempotencyKey = crypto.randomUUID();

    const sortedPayments = [...payments].sort((a, b) => b.amountPence - a.amountPence);
    const primaryMethod = sortedPayments[0]?.method || paymentMethod;

    const tenderedPence =
      totalCashAllocatedPence > 0
        ? Math.max(
            cashReceivedPence > 0 ? cashReceivedPence : totalCashAllocatedPence,
            totalCashAllocatedPence,
          )
        : null;

    const noteItems: string[] = [];
    if (payments.length > 1) {
      noteItems.push(
        `Split Payment: ${payments
          .map(
            (p) =>
              `${p.method === "cash" ? "Cash" : p.method === "card" ? "Card" : "Bank"} ${formatGBP(p.amountPence / 100)}`,
          )
          .join(" + ")}`,
      );
    }
    if (discountReceiptLabel && discountPence > 0) {
      noteItems.push(`${discountReceiptLabel} (-${formatGBP(discountPence / 100)})`);
    }
    const notesSummary = noteItems.length > 0 ? noteItems.join(" | ") : null;

    try {
      const sale = await completeSaleFn({
        data: {
          idempotency_key: idempotencyKey,
          customer_id: null,
          shift_id: openShift?.id || null,
          discount_pence: discountPence,
          payment_method: primaryMethod,
          amount_tendered_pence: tenderedPence,
          notes: notesSummary,
          items: cart.map((c) => ({
            product_id: c.product_id,
            quantity: c.quantity,
            unit_price_pence: c.unit_price_pence,
            discount_pence: c.discount_pence,
          })),
        },
      });

      toast.success(`Sale completed! Invoice #${sale.invoice_number}`);

      setInvoice({
        kind: "sale",
        number: sale.invoice_number,
        date: new Date().toLocaleString("en-GB"),
        customer:
          posCustomerName.trim() || posCustomerPhone.trim()
            ? {
                name: posCustomerName.trim() || null,
                phone: posCustomerPhone.trim() || null,
                email: null,
              }
            : null,
        lines: cart.map((c) => ({
          name: c.product_name,
          quantity: c.quantity,
          unit_price: c.unit_price_pence / 100,
          total: c.line_total_pence / 100,
        })),
        subtotal: subtotalPence / 100,
        discount: discountPence / 100,
        discountLabel: discountReceiptLabel,
        total: totalPence / 100,
        paid: true,
        amountPaid: (tenderedPence ?? totalPence) / 100,
        balanceDue: 0,
        paymentMethod:
          notesSummary ||
          (primaryMethod === "cash"
            ? "Cash"
            : primaryMethod === "card"
              ? "Credit Card"
              : "Bank Transfer"),
      });

      queryClient.invalidateQueries({ queryKey: ["active-products"] });
      queryClient.refetchQueries({ queryKey: ["active-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["open-shift"] });

      setCart([]);
      setPayments([]);
      setDiscountMode("none");
      setCustomDiscountPounds(0);
      setCashReceivedPounds("");
      setPosCustomerName("");
      setPosCustomerPhone("");
      setTimeout(() => searchRef.current?.focus(), 50);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sale failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
      </div>
    );
  }

  const cartTotalItems = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="space-y-3 max-w-[1920px] mx-auto lg:h-[calc(100vh-5.5rem)] flex flex-col min-h-0">
      {/* ── 1. Compact Operational POS Header ── */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <h1 className="text-sm sm:text-base font-black text-[#171717] tracking-tight">
            POS Register
          </h1>
          <span className="text-[#E5E5E5] font-bold">·</span>
          <span className="bg-[#F7F7F7] text-[#171717] text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border border-[#E5E5E5]">
            Counter Till #1
          </span>
          <span className="text-[#E5E5E5] font-bold">·</span>
          {openShift ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-emerald-950 text-xs">Till Open</span>
              <span className="text-xs text-emerald-700 font-mono font-bold">
                {formatGBP(openShift.opening_float_pence / 100)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-xs text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-bold text-xs">Till Closed</span>
            </div>
          )}
          <PageHelpButton
            pageTitle="POS Register"
            pageKey="pos"
            steps={[
              "Search or scan an item to add it to the cart.",
              "Select customer if requested (or leave as Walk-in).",
              "Choose payment method (Cash, Card, Bank Transfer).",
              "Click Complete Sale to finalize and print receipt.",
            ]}
            note="Open Till before taking cash payments."
            firstTimeTip="Tip: Search products by text or scan barcode directly. Ensure till is open for cash transactions."
          />
        </div>

        {/* Secondary Operational Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowShiftHistoryModal(true)}
            className="h-8 sm:h-8.5 px-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] hover:bg-[#F7F7F7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View Shift History"
          >
            <History className="w-3.5 h-3.5 text-[#666666]" />
            <span className="hidden sm:inline">Shift History</span>
          </button>

          {openShift ? (
            <button
              type="button"
              onClick={() => setShowCloseShiftModal(true)}
              className="h-8 sm:h-8.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Close Till</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowOpenShiftModal(true)}
              className="h-8 sm:h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Open Till</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCreateRepairModal(true)}
            className="h-8 sm:h-8.5 px-2.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-[#171717] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Create quick repair invoice"
          >
            <Zap className="w-3.5 h-3.5 text-[#AC313F]" />
            <span>+ Repair Invoice</span>
          </button>
        </div>
      </div>

      {/* ── 2. Main 2-Column POS Layout (Desktop: Viewport-Fitted Workspace) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0">
        {/* Left Column (60-65%): Search, Categories, and Fast Product Grid */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 space-y-2.5">
          {/* Prominent Search & Barcode Area */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search products, SKU or scan barcode (Enter to add to basket)…"
                className="w-full h-10 rounded-lg border border-[#E5E5E5] pl-10 pr-24 py-1.5 text-xs sm:text-sm font-semibold text-[#171717] placeholder:text-[#888888] focus:border-[#AC313F] focus:ring-2 focus:ring-[#AC313F]/20 outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    className="h-7 w-7 rounded text-[#666666] hover:bg-[#F7F7F7] hover:text-[#171717] flex items-center justify-center cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span
                  className="h-6.5 px-2 text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] rounded flex items-center justify-center text-[10px] font-mono gap-1 font-bold"
                  title="Barcode scanner ready"
                >
                  <Barcode className="w-3.5 h-3.5 text-[#AC313F]" />
                  <span className="hidden sm:inline">SCAN</span>
                </span>
              </div>
            </div>

            {/* Category Filter Rail & Stock Filter */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`h-7 px-2.5 rounded-md font-bold whitespace-nowrap transition-colors text-[11px] cursor-pointer ${
                        isSelected
                          ? "bg-[#171717] text-white shadow-2xs"
                          : "bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] hover:bg-[#EAEAEA]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-[#666666] shrink-0 select-none cursor-pointer pl-2">
                <input
                  type="checkbox"
                  checked={hideOutOfStock}
                  onChange={(e) => setHideOutOfStock(e.target.checked)}
                  className="rounded border-[#E5E5E5] text-[#AC313F] focus:ring-[#AC313F] cursor-pointer"
                />
                <span className="text-[11px] font-medium">Hide out of stock</span>
              </label>
            </div>
          </div>

          {/* Product Cards Grid (Scrollable inside workspace, top-aligned) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 flex-1 overflow-y-auto pr-1 min-h-[360px] lg:min-h-0 content-start auto-rows-max scrollbar-thin">
            {filteredProducts.map((p) => {
              const isService = p.type === "service";
              const isOutOfStock = !isService && p.stock_quantity <= 0;
              const isLowStock = !isService && p.stock_quantity > 0 && p.stock_quantity <= 3;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-[92px] group ${
                    isOutOfStock
                      ? "bg-[#F7F7F7] border-[#E5E5E5] opacity-60 cursor-not-allowed"
                      : "bg-white border-[#E5E5E5] hover:border-[#AC313F] hover:shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AC313F]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#171717] line-clamp-1 leading-snug group-hover:text-[#AC313F] transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-[#666666] font-mono truncate mt-0.5">
                      {p.sku ? `SKU: ${p.sku}` : p.category}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#F0F0F0] flex items-center justify-between mt-auto gap-1">
                    <span className="text-xs sm:text-sm font-black text-[#171717] tabular-nums font-mono">
                      {formatGBP(p.sale_price_pence / 100)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isService
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : isOutOfStock
                            ? "bg-rose-50 text-rose-700 border border-rose-200 uppercase"
                            : isLowStock
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isService
                        ? "Service"
                        : isOutOfStock
                          ? "Out of stock"
                          : `${p.stock_quantity} left`}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-2">
                <Search className="w-8 h-8 text-[#CCCCCC] mx-auto" />
                <div className="text-sm font-bold text-[#171717]">No products found</div>
                <div className="text-xs text-[#666666]">
                  No active products match &ldquo;{query}&rdquo; in {selectedCategory} category.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (35-40%): Anchored Cart & Tender Workspace */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-white border border-[#E5E5E5] rounded-xl shadow-xs overflow-hidden">
          {/* Section 1: Cart Header & Customer Inputs */}
          <div className="shrink-0 p-3 border-b border-[#E5E5E5] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#AC313F]" />
                <h2 className="font-black text-[#171717] text-xs sm:text-sm">Current Basket</h2>
                <span className="bg-[#AC313F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartTotalItems}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCart([]);
                    setPayments([]);
                    setPosCustomerName("");
                    setPosCustomerPhone("");
                    setDiscountMode("none");
                    setCustomDiscountPounds(0);
                  }}
                  className="text-[11px] text-[#666666] hover:text-[#DC2626] font-bold transition-colors cursor-pointer"
                >
                  Clear Basket
                </button>
              )}
            </div>

            {/* Optional Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <label className="text-[10px] font-bold text-[#666666] block mb-0.5">
                  Customer Name <span className="font-normal text-[#888888]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  className="w-full h-7 px-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs text-[#171717] placeholder:text-[#888888] focus:bg-white focus:border-[#AC313F] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#666666] block mb-0.5">
                  Phone <span className="font-normal text-[#888888]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 07123 456789"
                  value={posCustomerPhone}
                  onChange={(e) => setPosCustomerPhone(e.target.value)}
                  className="w-full h-7 px-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs text-[#171717] placeholder:text-[#888888] focus:bg-white focus:border-[#AC313F] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cart Items List (Flex Scroll Area) */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 bg-[#F7F7F7]/60 min-h-[140px] scrollbar-thin">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5E5E5] shadow-2xs text-xs"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-bold text-[#171717] truncate text-xs">{item.product_name}</div>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#666666] font-mono">
                    <span>£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        item.unit_price_pence === 0
                          ? ""
                          : (item.unit_price_pence / 100).toString()
                      }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateUnitPrice(item.product_id, isNaN(val) ? 0 : val);
                      }}
                      onBlur={(e) => {
                        if (!e.target.value || parseFloat(e.target.value) < 0) {
                          updateUnitPrice(item.product_id, item.original_price_pence / 100);
                        }
                      }}
                      className="w-14 px-1 py-0.5 font-mono text-[11px] border border-[#E5E5E5] rounded bg-white text-[#171717] font-semibold focus:border-[#AC313F] outline-none"
                      title="Edit unit price"
                    />
                    <span>each</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center border border-[#E5E5E5] rounded-md bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => changeQty(item.product_id, -1)}
                      className="h-6 w-6 flex items-center justify-center hover:bg-[#F7F7F7] text-[#171717] border-r border-[#E5E5E5] transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => {
                        const q = parseInt(e.target.value, 10);
                        updateQty(item.product_id, isNaN(q) ? 0 : q);
                      }}
                      className="w-7 text-center font-bold text-[#171717] outline-none text-xs bg-transparent py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Item quantity"
                    />
                    <button
                      type="button"
                      onClick={() => changeQty(item.product_id, 1)}
                      className="h-6 w-6 flex items-center justify-center hover:bg-[#F7F7F7] text-[#171717] border-l border-[#E5E5E5] transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <span className="font-bold text-[#171717] w-14 text-right font-mono text-xs tabular-nums">
                    {formatGBP(item.line_total_pence / 100)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product_id)}
                    className="h-6 w-6 rounded text-[#888888] hover:text-[#DC2626] hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-1.5 border-2 border-dashed border-[#E5E5E5] rounded-xl bg-white">
                <ShoppingCart className="w-6 h-6 text-[#CCCCCC] mx-auto" />
                <div className="text-xs font-bold text-[#171717]">Basket is empty</div>
                <div className="text-[11px] text-[#666666]">
                  Scan a barcode or click items on the left to add.
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Summary, Discounts & Tender (Anchored Bottom Controls) */}
          {cart.length > 0 && (
            <div className="shrink-0 p-3 border-t border-[#E5E5E5] bg-white space-y-2">
              {/* Subtotal & Discount row */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-[#666666]">
                  <span>Subtotal ({cartTotalItems} items)</span>
                  <span className="font-mono font-bold text-[#171717]">{formatGBP(subtotalPence / 100)}</span>
                </div>

                {/* Preset Discounts */}
                <div className="flex items-center justify-between pt-1 border-t border-[#F0F0F0]">
                  <span className="text-[11px] font-bold text-[#666666]">Discount</span>
                  <div className="inline-flex p-0.5 bg-[#F7F7F7] rounded-md border border-[#E5E5E5] text-[10px] font-bold">
                    {DISCOUNT_PRESETS.map((preset) => {
                      const isActive = discountMode === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setDiscountMode(preset.id);
                            if (preset.id !== "custom") setCustomDiscountPounds(0);
                          }}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#AC313F] text-white font-extrabold"
                              : "text-[#666666] hover:text-[#171717]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {discountMode === "custom" && (
                  <div className="flex items-center justify-between p-1.5 bg-[#F7F7F7] rounded-md border border-[#E5E5E5] text-xs">
                    <span className="text-[#666666] text-[11px]">Custom Discount</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#666666] font-bold">-£</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        autoFocus
                        value={customDiscountPounds || ""}
                        onChange={(e) => setCustomDiscountPounds(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-14 h-5.5 px-1 text-right font-bold font-mono text-xs text-[#171717] bg-white border border-[#E5E5E5] rounded outline-none focus:border-[#AC313F]"
                      />
                    </div>
                  </div>
                )}

                {discountPence > 0 && (
                  <div className="flex justify-between items-center text-xs text-[#AC313F] font-bold">
                    <span>{discountReceiptLabel || "Discount applied"}</span>
                    <span className="font-mono tabular-nums">−{formatGBP(discountPence / 100)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E5E5E5]">
                <span className="text-xs font-black uppercase tracking-wider text-[#171717]">Total Due</span>
                <span className="text-2xl font-black text-[#171717] font-mono tabular-nums">
                  {formatGBP(totalPence / 100)}
                </span>
              </div>

              {/* Payment Methods / Fast Allocation */}
              <div className="pt-1 border-t border-[#E5E5E5] space-y-1.5">
                {payments.length === 0 ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                      Fast Tender Full Amount ({formatGBP(totalPence / 100)}):
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => addFullPayment("cash")}
                        className="h-8 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#10B981] hover:bg-emerald-50 text-xs font-bold text-[#171717] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => addFullPayment("card")}
                        className="h-8 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#0284C7] hover:bg-sky-50 text-xs font-bold text-[#171717] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-sky-600" /> Card
                      </button>
                      <button
                        type="button"
                        onClick={() => addFullPayment("bank_transfer")}
                        className="h-8 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#F59E0B] hover:bg-amber-50 text-xs font-bold text-[#171717] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-600" /> Bank
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#666666]">Allocated Payments</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPayments([]);
                          setCashReceivedPounds("");
                        }}
                        className="text-[10px] text-[#DC2626] font-bold hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs py-1 px-2 bg-[#F7F7F7] rounded border border-[#E5E5E5]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#171717] capitalize">
                            {p.method === "bank_transfer" ? "Bank Transfer" : p.method}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePayment(p.id)}
                            className="text-[#888888] hover:text-[#DC2626] p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-[#171717]">
                          {formatGBP(p.amountPence / 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Remaining Amount & Split payment trigger */}
                {remainingPence > 0 && payments.length > 0 && !showAddPayment && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddPaymentPounds((remainingPence / 100).toFixed(2));
                      setShowAddPayment(true);
                    }}
                    className="text-[11px] font-bold text-[#AC313F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Split Tender ({formatGBP(remainingPence / 100)} remaining)
                  </button>
                )}

                {/* Inline Split Payment Form */}
                {showAddPayment && (
                  <div className="p-2 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171717] text-[11px]">Add Split Tender</span>
                      <button
                        type="button"
                        onClick={() => setShowAddPayment(false)}
                        className="text-[#888888] hover:text-[#171717] text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["cash", "card", "bank_transfer"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setAddPaymentMethod(m)}
                          className={`py-1 text-[11px] font-bold rounded border capitalize cursor-pointer ${
                            addPaymentMethod === m
                              ? "bg-[#171717] text-white border-[#171717]"
                              : "bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F0F0F0]"
                          }`}
                        >
                          {m === "bank_transfer" ? "Bank" : m}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="font-bold text-[#666666]">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={remainingPence / 100}
                          value={addPaymentPounds}
                          onChange={(e) => setAddPaymentPounds(e.target.value)}
                          className="w-full h-7 px-2 font-mono font-bold text-xs border border-[#E5E5E5] rounded bg-white outline-none focus:border-[#AC313F]"
                          placeholder={(remainingPence / 100).toFixed(2)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomPayment}
                        className="h-7 px-2.5 bg-[#171717] text-white rounded text-xs font-bold hover:bg-[#262626] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Cash Tender & Change Due */}
                {totalCashAllocatedPence > 0 && (
                  <div className="p-2 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5] space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#171717]">Cash Tendered</span>
                      <span className="text-[#666666] font-mono">
                        Due: {formatGBP(totalCashAllocatedPence / 100)}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {["Exact", "5", "10", "20", "50", "100"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            if (val === "Exact") {
                              setCashReceivedPounds((totalCashAllocatedPence / 100).toFixed(2));
                            } else {
                              setCashReceivedPounds(val);
                            }
                          }}
                          className="h-5.5 rounded bg-white border border-[#E5E5E5] text-[#171717] font-bold hover:bg-[#EAEAEA] text-[10px] cursor-pointer"
                        >
                          {val === "Exact" ? "Exact" : `£${val}`}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5] text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-[#666666]">Received: £</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={cashReceivedPounds}
                          onChange={(e) => setCashReceivedPounds(e.target.value)}
                          placeholder={(totalCashAllocatedPence / 100).toFixed(2)}
                          className="w-14 h-6 px-1 bg-white border border-[#E5E5E5] rounded text-right font-bold text-xs text-[#171717] outline-none focus:border-[#AC313F]"
                        />
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-[#666666] text-[11px]">Change:</span>
                        <span className="font-black text-emerald-700 text-xs">
                          {formatGBP(changePence / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shift Warning for Cash */}
              {isCashSaleWithoutShift && (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 text-xs font-bold flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Till shift required for cash
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOpenShiftModal(true)}
                    className="px-2 py-1 bg-amber-600 text-white rounded text-[10px] font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    Open Till
                  </button>
                </div>
              )}

              {/* Anchored Primary COMPLETE SALE Action */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0 || remainingPence > 0}
                className="w-full h-11 sm:h-12 rounded-xl bg-[#AC313F] hover:bg-[#782939] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {remainingPence > 0
                  ? `Allocate Remaining ${formatGBP(remainingPence / 100)}`
                  : isCashSaleWithoutShift
                    ? "Open Till to Complete"
                    : `COMPLETE SALE — ${formatGBP(totalPence / 100)}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shift Modals */}
      <Suspense fallback={null}>
        {showOpenShiftModal && (
          <OpenShiftModal
            onClose={() => setShowOpenShiftModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["open-shift"] });
            }}
          />
        )}

        {showCloseShiftModal && openShift && (
          <CloseShiftModal
            shiftId={openShift.id}
            onClose={() => setShowCloseShiftModal(false)}
            onSuccess={(result) => {
              setReconciliationResult(result);
              queryClient.invalidateQueries({ queryKey: ["open-shift"] });
            }}
          />
        )}

        {reconciliationResult && (
          <ShiftReconciliationResultModal
            data={reconciliationResult}
            onClose={() => setReconciliationResult(null)}
          />
        )}

        {showShiftHistoryModal && (
          <ShiftHistoryModal onClose={() => setShowShiftHistoryModal(false)} />
        )}

        {/* Invoice / Receipt Modal */}
        {invoice && <InvoiceModal data={invoice} onClose={() => setInvoice(null)} />}

        {/* Quick Repair A4 Invoice (after creation) */}
        {quickRepairInvoice && (
          <RepairA4InvoiceModal
            isOpen={!!quickRepairInvoice}
            onClose={() => setQuickRepairInvoice(null)}
            repair={quickRepairInvoice}
          />
        )}
      </Suspense>

      {/* Quick Repair Invoice Create Modal (outside Suspense — eagerly imported) */}
      <CreateRepairInvoiceModal
        isOpen={showCreateRepairModal}
        onClose={() => setShowCreateRepairModal(false)}
        onSuccess={(repair) => {
          setShowCreateRepairModal(false);
          setQuickRepairInvoice(repair);
        }}
      />
    </div>
  );
}
