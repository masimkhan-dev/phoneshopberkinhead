import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listProducts,
  saveProduct,
  deactivateProduct,
  adjustStock,
  listStockMovements,
} from "@/lib/products.functions";
import { formatGBP } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton, ContextTip } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  History,
  PackagePlus,
  X,
  Search,
  FileSpreadsheet,
  Tag,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Barcode,
  Wrench,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  Percent,
} from "lucide-react";

// Lazy load heavy auxiliary components
const OpeningStockSummary = lazy(() =>
  import("@/components/dashboard/OpeningStockSummary").then((m) => ({
    default: m.OpeningStockSummary,
  })),
);
const CSVImportModal = lazy(() =>
  import("@/components/dashboard/CSVImportModal").then((m) => ({
    default: m.CSVImportModal,
  })),
);
const ProductLabelModal = lazy(() =>
  import("@/components/dashboard/ProductLabelModal").then((m) => ({
    default: m.ProductLabelModal,
  })),
);

export const Route = createFileRoute("/_authenticated/dashboard/products")({
  component: ProductsPage,
});

// ── Contextual Categories ───────────────────────────────────────────────────
const REPAIR_PART_CATEGORIES = [
  "Screens",
  "Batteries",
  "Charging Ports",
  "Back Glass",
  "Cameras",
  "Speakers & Audio",
  "Housings & Frames",
  "Laptop Parts",
  "Console Parts",
  "Other Repair Parts",
];

const RETAIL_PRODUCT_CATEGORIES = [
  "Cases & Covers",
  "Chargers & Power",
  "Cables & Leads",
  "Screen Protectors",
  "Audio & Headphones",
  "Mobile Phones & Handsets",
  "Tablets & iPads",
  "Laptops & Computers",
  "Gaming & Consoles",
  "Accessories",
  "Other Retail",
];

const emptyProduct = {
  id: "",
  name: "",
  category: "Screens",
  sku: "",
  barcode: "",
  type: "part" as "product" | "part",
  cost_price_pounds: "",
  sale_price_pounds: "",
  stock_quantity: 0,
  low_stock_threshold: 5,
  has_low_stock_alert: true,
  warranty_mode: "days" as "none" | "days",
  warranty_days: 90,
  status: "active" as "active" | "inactive",
};

function ProductsPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listProducts);
  const saveFn = useServerFn(saveProduct);
  const deactivateFn = useServerFn(deactivateProduct);
  const adjustFn = useServerFn(adjustStock);
  const listMovementsFn = useServerFn(listStockMovements);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [page, setPage] = useState(0);
  const [filterTab, setFilterTab] = useState<
    "all" | "product" | "part" | "low_stock" | "out_of_stock"
  >("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Modal form states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...emptyProduct });
  const [customSkuEnabled, setCustomSkuEnabled] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Smart naming builder state (for parts)
  const [showSmartNaming, setShowSmartNaming] = useState(false);
  const [smartDevice, setSmartDevice] = useState("");
  const [smartPart, setSmartPart] = useState("Screen");
  const [smartVariant, setSmartVariant] = useState("Premium OLED");

  // Auxiliary modals
  const [adjustFor, setAdjustFor] = useState<{ id: string; name: string } | null>(null);
  const [adjDelta, setAdjDelta] = useState(0);
  const [adjReason, setAdjReason] = useState("adjustment");
  const [adjNote, setAdjNote] = useState("");
  const [historyFor, setHistoryFor] = useState<{ id: string; name: string } | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [labelProduct, setLabelProduct] = useState<{
    id: string;
    name: string;
    category: string;
    sku: string | null;
    sale_price_pence: number;
    barcode?: string | null;
  } | null>(null);

  // Query products list
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["products", debouncedSearch, page],
    queryFn: async () => {
      try {
        return await listFn({ data: { search: debouncedSearch, page, limit: 50 } });
      } catch (err) {
        console.error("Failed to fetch products:", err);
        throw err;
      }
    },
    staleTime: 1000 * 30,
  });

  const { data: movementsData } = useQuery({
    queryKey: ["stock-movements", historyFor?.id],
    queryFn: () => (historyFor ? listMovementsFn({ data: { product_id: historyFor.id } }) : null),
    enabled: !!historyFor,
    staleTime: 1000 * 30,
  });

  // Summary counts
  const totalCount = data?.total ?? data?.rows?.length ?? 0;
  const lowStockCount = useMemo(
    () =>
      (data?.rows ?? []).filter(
        (p) => p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0,
      ).length,
    [data?.rows],
  );
  const outOfStockCount = useMemo(
    () => (data?.rows ?? []).filter((p) => p.stock_quantity === 0).length,
    [data?.rows],
  );
  const retailCount = useMemo(
    () => (data?.rows ?? []).filter((p) => p.type === "product").length,
    [data?.rows],
  );
  const partsCount = useMemo(
    () => (data?.rows ?? []).filter((p) => p.type === "part").length,
    [data?.rows],
  );

  // Derived available categories for the filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    (data?.rows ?? []).forEach((p) => {
      if (p.category?.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats).sort();
  }, [data?.rows]);

  // Filtered rows
  const filtered = useMemo(() => {
    return (data?.rows ?? []).filter((p) => {
      if (filterTab === "product" && p.type !== "product") return false;
      if (filterTab === "part" && p.type !== "part") return false;
      if (
        filterTab === "low_stock" &&
        !(p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0)
      )
        return false;
      if (filterTab === "out_of_stock" && p.stock_quantity !== 0) return false;
      if (
        selectedCategoryFilter !== "all" &&
        p.category?.toLowerCase() !== selectedCategoryFilter.toLowerCase()
      )
        return false;
      return true;
    });
  }, [data?.rows, filterTab, selectedCategoryFilter]);

  // Contextual categories for modal
  const currentCategories =
    form.type === "part" ? REPAIR_PART_CATEGORIES : RETAIL_PRODUCT_CATEGORIES;

  // Margin calculation for modal
  const costNum = parseFloat(form.cost_price_pounds) || 0;
  const saleNum = parseFloat(form.sale_price_pounds) || 0;
  const grossProfit = saleNum - costNum;
  const marginPercent = saleNum > 0 ? (grossProfit / saleNum) * 100 : 0;
  const isBelowCost = saleNum > 0 && costNum > 0 && saleNum < costNum;

  function handleOpenCreate() {
    setEditing(false);
    setForm({ ...emptyProduct });
    setCustomSkuEnabled(false);
    setIsCustomCategory(false);
    setCustomCategoryInput("");
    setShowSmartNaming(false);
    setIsItemModalOpen(true);
  }

  function handleOpenEdit(p: any) {
    setEditing(true);
    const isStdPart = REPAIR_PART_CATEGORIES.includes(p.category);
    const isStdRetail = RETAIL_PRODUCT_CATEGORIES.includes(p.category);
    const isCustom = !isStdPart && !isStdRetail;

    setIsCustomCategory(isCustom);
    if (isCustom) setCustomCategoryInput(p.category);
    setCustomSkuEnabled(Boolean(p.sku));
    setShowSmartNaming(false);

    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      sku: p.sku || "",
      barcode: p.barcode || "",
      type: (p.type === "product" ? "product" : "part") as any,
      cost_price_pounds: (p.cost_price_pence / 100).toString(),
      sale_price_pounds: (p.sale_price_pence / 100).toString(),
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold ?? 5,
      has_low_stock_alert: (p.low_stock_threshold ?? 5) > 0,
      warranty_mode: p.warranty_days && p.warranty_days > 0 ? "days" : "none",
      warranty_days: p.warranty_days || 90,
      status: p.status as any,
    });

    setIsItemModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent, addAnother = false) {
    e.preventDefault();
    if (!form.name.trim()) {
      toastError("Item Name is required");
      return;
    }

    const finalCategory = isCustomCategory ? customCategoryInput.trim() : form.category.trim();
    if (!finalCategory) {
      toastError("Category is required");
      return;
    }

    const costVal = parseFloat(form.cost_price_pounds);
    const saleVal = parseFloat(form.sale_price_pounds);

    if (isNaN(costVal) || costVal < 0) {
      toastError("Cost Price must be a valid non-negative number (£)");
      return;
    }
    if (isNaN(saleVal) || saleVal < 0) {
      toastError("Default Selling Price must be a valid non-negative number (£)");
      return;
    }

    setSubmitting(true);
    const costPence = Math.round(costVal * 100);
    const salePence = Math.round(saleVal * 100);
    const warrantyDays = form.warranty_mode === "days" ? Number(form.warranty_days) || 0 : 0;

    const payload = {
      id: form.id ? form.id : undefined,
      name: form.name.trim(),
      category: finalCategory,
      sku: form.sku?.trim() || null,
      barcode: form.barcode?.trim() || null,
      type: form.type,
      cost_price_pence: costPence,
      sale_price_pence: salePence,
      stock_quantity: Number(form.stock_quantity) || 0,
      low_stock_threshold: form.has_low_stock_alert ? Number(form.low_stock_threshold) || 5 : 0,
      warranty_days: warrantyDays,
      status: form.status,
    };

    try {
      await saveFn({ data: payload });
      toastSuccess(editing ? "Item updated successfully!" : "Product / part saved successfully!");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["active-products"] });
      await queryClient.invalidateQueries({ queryKey: ["opening-stock-summary"] });

      if (addAnother) {
        // Retain type and category for fast batch entry
        setForm({
          ...emptyProduct,
          type: form.type,
          category: form.category,
        });
        setIsCustomCategory(false);
        setCustomCategoryInput("");
        setCustomSkuEnabled(false);
      } else {
        setIsItemModalOpen(false);
        setEditing(false);
        setForm({ ...emptyProduct });
      }
    } catch (err: unknown) {
      console.error("Save product error:", err);
      toastError(err, "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this inventory item? (It will be hidden from POS & Repair forms)"))
      return;
    try {
      await deactivateFn({ data: { id } });
      toastSuccess("Item deactivated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["active-products"] });
    } catch (err: unknown) {
      toastError(err, "Failed to deactivate item");
    }
  }

  async function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustFor || adjDelta === 0) return;
    setAdjusting(true);
    try {
      const res = await adjustFn({
        data: {
          product_id: adjustFor.id,
          qty_change: adjDelta,
          reason: adjReason,
          note: adjNote || null,
        },
      });
      toastSuccess(`Stock adjusted! Ref #${res.adj_number} (${res.qty_before} → ${res.qty_after})`);
      setAdjustFor(null);
      setAdjDelta(0);
      setAdjNote("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["active-products"] });
      queryClient.invalidateQueries({ queryKey: ["opening-stock-summary"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    } catch (err: unknown) {
      toastError(err, "Stock adjustment failed");
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header & Top Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#AC313F]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Inventory &amp; Repair Parts
            </h1>
            <PageHelpButton
              pageTitle="Inventory & Repair Parts"
              pageKey="inventory"
              steps={[
                "Click '+ Add Item' to create new products or repair replacement components.",
                "Use 'Import CSV' for bulk initial catalog setup.",
                "Monitor Low Stock and Out of Stock alerts directly from the overview counters.",
                "Adjust stock quantities using the (+/-) button in the inventory table for a complete audit trail.",
              ]}
              firstTimeTip="Tip: The primary inventory screen is designed for searching, pricing checks, and stock management. Item creation is available via '+ Add Item'."
            />
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Manage retail stock, repair components, price margins, barcodes and warranty rules.
          </p>
        </div>

        {/* Header Action Hierarchy: Import CSV (Secondary) + Add Item (Primary Red) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] hover:bg-[#F7F7F7] hover:border-[#E5E5E5] text-neutral-700 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-500" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#AC313F] hover:bg-[#782939] text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Item</span>
          </button>
        </div>
      </div>

      {/* ── Summary Counters (Fast Overview) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Total Inventory
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#171717] tabular-nums font-mono">
                {totalCount}
              </span>
              <span className="text-xs text-neutral-500 font-semibold">
                ({retailCount} retail, {partsCount} parts)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-600 tabular-nums font-mono">
                {lowStockCount}
              </span>
              <span className="text-xs text-neutral-500 font-semibold">below threshold</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
              Out of Stock
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-red-600 tabular-nums font-mono">
                {outOfStockCount}
              </span>
              <span className="text-xs text-neutral-500 font-semibold">needs reorder</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Opening Stock Audit Summary (Collapsible/Auxiliary) */}
      <Suspense fallback={<TableSkeleton rows={2} cols={4} />}>
        <OpeningStockSummary />
      </Suspense>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search bar supporting barcode scan */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, SKU, category or scan barcode…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-8 h-9 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#AC313F] focus:ring-1 focus:ring-[#AC313F]/20 outline-none transition-all placeholder:text-neutral-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Barcode className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>

          {/* Category Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-9 px-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl text-xs font-bold text-neutral-700 outline-none focus:border-[#AC313F] cursor-pointer"
            >
              <option value="all">All Categories ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none border-t border-neutral-100 pt-2 text-xs">
          {[
            { id: "all", label: "All Items", count: totalCount },
            { id: "product", label: "Retail Products", count: retailCount },
            { id: "part", label: "Repair Parts", count: partsCount },
            { id: "low_stock", label: "Low Stock", count: lowStockCount },
            { id: "out_of_stock", label: "Out of Stock", count: outOfStockCount },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === t.id
                  ? "bg-[#AC313F] text-white shadow-xs font-extrabold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  filterTab === t.id
                    ? "bg-white/20 text-white"
                    : t.id === "low_stock" && t.count > 0
                      ? "bg-amber-100 text-amber-800"
                      : t.id === "out_of_stock" && t.count > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary Inventory Table ── */}
      {isLoading ? (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <TableSkeleton rows={6} cols={9} />
        </div>
      ) : queryError ? (
        <div className="p-4 text-red-600 bg-red-50 rounded-xl text-xs font-bold border border-red-200">
          Failed to load inventory products.
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F7] border-b border-[#E5E5E5] text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Item &amp; Identifiers</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-center">Warranty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        title="No inventory items found"
                        description="Try adjusting your search query, clearing filters, or create a new item."
                        actionLabel="Clear Filters"
                        onAction={() => {
                          setSearchQuery("");
                          setFilterTab("all");
                          setSelectedCategoryFilter("all");
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const threshold = p.low_stock_threshold ?? 5;
                    const isOutOfStock = p.stock_quantity === 0;
                    const isLowStock = !isOutOfStock && p.stock_quantity <= threshold;
                    const typeLabel = p.type === "product" ? "Retail" : "Repair Part";

                    // Margin calculation
                    const costP = p.cost_price_pence / 100;
                    const saleP = p.sale_price_pence / 100;
                    const profit = saleP - costP;
                    const margin = saleP > 0 ? Math.round((profit / saleP) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-[#F7F7F7]/80 transition-colors">
                        {/* Item Name + SKU/Barcode */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#171717] leading-snug">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono text-neutral-400">
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.type === "product"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {typeLabel}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 font-semibold text-neutral-600">{p.category}</td>

                        {/* Cost */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-500">
                          {formatGBP(costP)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-mono font-black text-[#171717]">
                          {formatGBP(saleP)}
                        </td>

                        {/* Margin % */}
                        <td className="py-3 px-4 text-center">
                          {saleP > 0 ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                margin >= 40
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : margin > 0
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                              title={`Gross profit: ${formatGBP(profit)} per unit`}
                            >
                              {margin}%
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>

                        {/* Stock Level */}
                        <td className="py-3 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200 font-mono">
                              0 Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                              {p.stock_quantity} Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              {p.stock_quantity} In Stock
                            </span>
                          )}
                        </td>

                        {/* Warranty */}
                        <td className="py-3 px-4 text-center text-neutral-600 font-bold font-mono">
                          {p.warranty_days ? `${p.warranty_days}d` : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setLabelProduct(p)}
                              title="Print Barcode / Price Label"
                              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-[#171717] transition-colors cursor-pointer"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdjustFor({ id: p.id, name: p.name })}
                              title="Auditable Stock Adjustment (+/-)"
                              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-[#AC313F] transition-colors cursor-pointer"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setHistoryFor({ id: p.id, name: p.name })}
                              title="View Stock Movement Audit History"
                              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-[#171717] transition-colors cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Item"
                              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeactivate(p.id)}
                              title="Deactivate Item"
                              className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5] bg-[#F7F7F7] text-xs text-neutral-500 font-medium">
              <span>
                Showing {page * 50 + 1}–{Math.min((page + 1) * 50, data.total)} of {data.total} items
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-[#E5E5E5] disabled:opacity-40 font-bold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * 50 >= data.total}
                  className="px-3 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-[#E5E5E5] disabled:opacity-40 font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── ADD / EDIT ITEM MODAL WORKSPACE ───────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <form
            onSubmit={(e) => handleSubmit(e, false)}
            className="bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] bg-white">
              <div>
                <h2 className="text-base font-black text-[#171717]">
                  {editing ? "Edit Inventory Item" : "Add New Inventory Item"}
                </h2>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">
                  {editing
                    ? "Update item details, suggested prices and warranty rules."
                    : "Create a new retail product SKU or repair replacement component."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              {/* 1. Item Type (Segmented control) */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
                  Item Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        type: "part",
                        category: REPAIR_PART_CATEGORIES[0],
                      });
                      setIsCustomCategory(false);
                    }}
                    className={`py-2 px-3 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      form.type === "part"
                        ? "bg-white text-[#171717] shadow-xs border border-[#E5E5E5]/80"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-[#AC313F]" />
                    <span>Repair Part</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        type: "product",
                        category: RETAIL_PRODUCT_CATEGORIES[0],
                      });
                      setIsCustomCategory(false);
                    }}
                    className={`py-2 px-3 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      form.type === "product"
                        ? "bg-white text-[#171717] shadow-xs border border-[#E5E5E5]/80"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span>Retail Product</span>
                  </button>
                </div>
              </div>

              {/* 2. Contextual Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    Contextual to {form.type === "part" ? "Repair Parts" : "Retail Products"}
                  </span>
                </div>

                {!isCustomCategory ? (
                  <select
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomCategory(true);
                        setCustomCategoryInput("");
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                    className="w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-bold text-[#171717] bg-white focus:border-[#AC313F] outline-none cursor-pointer"
                  >
                    {currentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!currentCategories.includes(form.category) && form.category && (
                      <option value={form.category}>{form.category}</option>
                    )}
                    <option value="__custom__">+ Add Custom Category…</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter custom category name…"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      autoFocus
                      className="w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-semibold focus:border-[#AC313F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setForm({ ...form, category: currentCategories[0] });
                      }}
                      className="h-9 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold rounded-xl cursor-pointer shrink-0"
                    >
                      Back to list
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Smart Naming Helper for Repair Parts */}
              {form.type === "part" && (
                <div className="p-3 bg-[#F7F7F7]/90 border border-[#E5E5E5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Smart Naming Helper (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSmartNaming((v) => !v)}
                      className="text-[10.5px] font-bold text-[#AC313F] hover:underline cursor-pointer"
                    >
                      {showSmartNaming ? "Hide Helper" : "Show Helper"}
                    </button>
                  </div>

                  {showSmartNaming && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                            Device
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. iPhone 14"
                            value={smartDevice}
                            onChange={(e) => setSmartDevice(e.target.value)}
                            className="w-full h-7 px-2 border border-[#E5E5E5] rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                            Part
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Screen, Battery"
                            value={smartPart}
                            onChange={(e) => setSmartPart(e.target.value)}
                            className="w-full h-7 px-2 border border-[#E5E5E5] rounded-lg text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                            Variant / Quality
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Premium OLED"
                            value={smartVariant}
                            onChange={(e) => setSmartVariant(e.target.value)}
                            className="w-full h-7 px-2 border border-[#E5E5E5] rounded-lg text-xs font-medium"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const parts = [smartDevice.trim(), smartVariant.trim(), smartPart.trim()].filter(
                            Boolean,
                          );
                          if (parts.length > 0) {
                            setForm({ ...form, name: parts.join(" ") });
                          }
                        }}
                        className="text-[11px] font-bold text-[#AC313F] hover:bg-red-50 px-2 py-1 rounded-md transition-colors cursor-pointer border border-[#AC313F]/30"
                      >
                        Apply Name: {[smartDevice, smartVariant, smartPart].filter(Boolean).join(" ") || "..."}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Item Name */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 14 Premium OLED Screen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-bold text-[#171717] focus:border-[#AC313F] outline-none"
                />
              </div>

              {/* 5. Pricing & Live Gross Profit / Margin */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
                  Pricing &amp; Margins
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-500 mb-0.5">
                      Cost Price (£) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                        £
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={form.cost_price_pounds}
                        onChange={(e) => setForm({ ...form, cost_price_pounds: e.target.value })}
                        className="w-full h-9 pl-6 pr-2 rounded-xl border border-[#E5E5E5] text-xs font-mono font-bold text-[#171717] focus:border-[#AC313F] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-500 mb-0.5">
                      Default Selling Price (£) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                        £
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={form.sale_price_pounds}
                        onChange={(e) => setForm({ ...form, sale_price_pounds: e.target.value })}
                        className="w-full h-9 pl-6 pr-2 rounded-xl border border-[#E5E5E5] text-xs font-mono font-bold text-[#171717] focus:border-[#AC313F] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Margin Calculation Card */}
                {saleNum > 0 && costNum > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-150 ${
                      isBelowCost
                        ? "bg-red-50/80 border-red-200 text-red-800"
                        : "bg-[#F7F7F7] border-[#E5E5E5] text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isBelowCost ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block">
                          {isBelowCost
                            ? "Selling price is below cost!"
                            : `Gross Profit: £${grossProfit.toFixed(2)} per unit`}
                        </span>
                        <span className="text-[10.5px] text-neutral-500 font-medium">
                          {isBelowCost
                            ? `Loss of £${Math.abs(grossProfit).toFixed(2)} per item sold.`
                            : `Cost £${costNum.toFixed(2)} → Selling £${saleNum.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black font-mono px-2 py-0.5 rounded-md ${
                          isBelowCost
                            ? "bg-red-200/80 text-red-900"
                            : marginPercent >= 40
                              ? "bg-emerald-100 text-emerald-900 font-extrabold"
                              : "bg-blue-100 text-blue-900 font-extrabold"
                        }`}
                      >
                        {marginPercent.toFixed(1)}% Margin
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Identifiers: SKU & Barcode */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10.5px] font-bold text-neutral-500">SKU Code</label>
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => setCustomSkuEnabled((v) => !v)}
                        className="text-[10px] font-bold text-[#AC313F] hover:underline cursor-pointer"
                      >
                        {customSkuEnabled ? "Auto-generate" : "Custom SKU"}
                      </button>
                    )}
                  </div>
                  {customSkuEnabled || editing ? (
                    <input
                      type="text"
                      placeholder="e.g. ACC-0001"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-mono font-bold text-[#171717] focus:border-[#AC313F] outline-none"
                    />
                  ) : (
                    <div className="w-full h-9 rounded-xl border border-dashed border-[#E5E5E5] px-3 flex items-center text-xs font-medium text-neutral-400 bg-[#F7F7F7]/60">
                      Generated automatically after save
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 mb-0.5">
                    Barcode <span className="font-normal text-neutral-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Barcode className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Scan or enter barcode"
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                      className="w-full h-9 pl-7 pr-2 rounded-xl border border-[#E5E5E5] text-xs font-mono font-bold text-[#171717] focus:border-[#AC313F] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Stock Semantics & Low Stock Alert */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-600 mb-0.5">
                    {editing ? "Current Stock on Hand" : "Opening Stock Quantity"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={editing}
                    placeholder="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                    className={`w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-mono font-bold text-[#171717] outline-none ${
                      editing
                        ? "bg-neutral-100 text-neutral-500 cursor-not-allowed border-dashed"
                        : "focus:border-[#AC313F]"
                    }`}
                  />
                  <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                    {editing
                      ? "To change stock, use Stock Adjustment (+/-) in table for audit trail."
                      : "Quantity physically in shop when first creating this item."}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10.5px] font-bold text-neutral-600">Low Stock Alert</label>
                    <label className="inline-flex items-center gap-1 cursor-pointer text-[10px] text-neutral-500">
                      <input
                        type="checkbox"
                        checked={form.has_low_stock_alert}
                        onChange={(e) =>
                          setForm({ ...form, has_low_stock_alert: e.target.checked })
                        }
                        className="rounded border-[#E5E5E5] text-[#AC313F] focus:ring-[#AC313F]"
                      />
                      <span>Enable</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    disabled={!form.has_low_stock_alert}
                    placeholder="5"
                    value={form.has_low_stock_alert ? form.low_stock_threshold : 0}
                    onChange={(e) =>
                      setForm({ ...form, low_stock_threshold: Number(e.target.value) })
                    }
                    className={`w-full h-9 rounded-xl border border-[#E5E5E5] px-3 text-xs font-mono font-bold text-[#171717] outline-none ${
                      !form.has_low_stock_alert
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : "focus:border-[#AC313F]"
                    }`}
                  />
                  <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                    Triggers amber badge when quantity reaches this level.
                  </span>
                </div>
              </div>

              {/* 8. Default Warranty */}
              <div className="p-3 bg-[#F7F7F7]/80 border border-[#E5E5E5] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
                    Default Warranty Policy
                  </span>
                  <div className="inline-flex p-0.5 bg-neutral-200/80 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, warranty_mode: "none", warranty_days: 0 })}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        form.warranty_mode === "none"
                          ? "bg-white text-[#171717] shadow-2xs font-black"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      No Warranty
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          warranty_mode: "days",
                          warranty_days: form.warranty_days || 90,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        form.warranty_mode === "days"
                          ? "bg-[#AC313F] text-white shadow-2xs font-black"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Warranty Days
                    </button>
                  </div>
                </div>

                {form.warranty_mode === "days" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="1"
                        value={form.warranty_days}
                        onChange={(e) => setForm({ ...form, warranty_days: Number(e.target.value) })}
                        className="w-full h-8 px-2 text-center font-mono font-bold text-xs bg-white border border-[#E5E5E5] rounded-lg focus:border-[#AC313F] outline-none"
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600">days</span>
                    <div className="flex gap-1 ml-auto">
                      {[30, 90, 180, 365].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setForm({ ...form, warranty_days: d })}
                          className={`px-2 py-0.5 text-[10.5px] rounded-md font-bold transition-colors cursor-pointer ${
                            form.warranty_days === d
                              ? "bg-[#AC313F] text-white"
                              : "bg-white text-neutral-600 border border-[#E5E5E5] hover:bg-neutral-100"
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10.5px] text-neutral-400 italic">
                    No warranty will be printed on receipts for this item.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-[#E5E5E5] bg-[#F7F7F7]">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 bg-white border border-[#E5E5E5] hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {!editing && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, true)}
                    className="px-4 py-2 bg-white border border-[#E5E5E5] hover:bg-neutral-100 text-neutral-800 font-extrabold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Save &amp; Add Another
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#AC313F] hover:bg-[#782939] text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{editing ? "Update Item" : "Save Item"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Adjust Stock Modal ── */}
      {adjustFor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white border border-[#E5E5E5] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="font-extrabold text-sm text-[#171717]">
                Adjust Stock: {adjustFor.name}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustFor(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                Quantity Change (+ to Add, - to Deduct)
              </label>
              <input
                type="number"
                value={adjDelta}
                onChange={(e) => setAdjDelta(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E5E5E5] px-3 py-2 text-sm font-extrabold focus:border-[#AC313F] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                Adjustment Reason
              </label>
              <select
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E5] px-3 py-2 text-xs font-semibold focus:border-[#AC313F] outline-none bg-white cursor-pointer"
              >
                <option value="adjustment">Manual Correction / Count</option>
                <option value="damaged">Damaged / Broken Stock</option>
                <option value="return">Customer Return</option>
                <option value="purchase">Initial Stock Addition</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                Audit Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Stock audit variance"
                value={adjNote}
                onChange={(e) => setAdjNote(e.target.value)}
                className="w-full rounded-xl border border-[#E5E5E5] px-3 py-2 text-xs font-medium focus:border-[#AC313F] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustFor(null)}
                className="btn-outline !py-2 !px-4 !text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjusting || adjDelta === 0}
                className="btn-primary !py-2 !px-4 !text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                {adjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Movement Audit History Modal ── */}
      {historyFor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="font-extrabold text-sm text-[#171717]">
                Movement Log: {historyFor.name}
              </h3>
              <button
                type="button"
                onClick={() => setHistoryFor(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 text-xs">
              {!movementsData ? (
                <div className="text-center py-6 text-neutral-400">Loading audit history...</div>
              ) : (movementsData.rows ?? []).length === 0 ? (
                <div className="text-center py-6 text-neutral-400">
                  No movement records logged for this item yet.
                </div>
              ) : (
                (movementsData.rows ?? []).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#F7F7F7] border border-neutral-100 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-extrabold text-[#171717] capitalize">
                        {m.reason} ({m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change})
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {new Date(m.created_at).toLocaleString()}
                        {m.reference_number && ` • Ref #${m.reference_number}`}
                      </div>
                      {m.notes && <div className="text-[11px] text-neutral-600 mt-0.5">{m.notes}</div>}
                    </div>
                    <div className="font-mono font-bold text-neutral-700 text-xs">
                      {m.quantity_before} → {m.quantity_after}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Auxiliary Modals (Lazy Loaded) ── */}
      <Suspense fallback={null}>
        {importModalOpen && (
          <CSVImportModal
            onClose={() => setImportModalOpen(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["products"] });
              queryClient.invalidateQueries({ queryKey: ["active-products"] });
              queryClient.invalidateQueries({ queryKey: ["opening-stock-summary"] });
            }}
          />
        )}

        {labelProduct && (
          <ProductLabelModal onClose={() => setLabelProduct(null)} product={labelProduct} />
        )}
      </Suspense>
    </div>
  );
}
