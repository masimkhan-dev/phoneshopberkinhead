import { useState, useCallback, useEffect, useRef } from "react";
import {
  X, Smartphone, User, Loader2, CheckCircle2, AlertCircle,
  Banknote, CreditCard, Building2, Search, ShieldCheck, Tag,
  Plus, AlertTriangle, ChevronDown, ChevronRight, Check, Receipt,
  Sparkles, RefreshCw, CheckCheck, HelpCircle
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { sellPhone, searchPhoneUnits } from "@/lib/phone-buy-sell.functions";
import { searchCustomers, saveCustomer } from "@/lib/customers.functions";
import { toastSuccess, toastError } from "@/lib/toast";
import { type PhoneSaleInvoiceData } from "./PhoneSaleInvoice";

interface PhoneUnit {
  id: string;
  stock_number: string;
  brand: string;
  model: string;
  storage?: string | null;
  colour?: string | null;
  imei1: string;
  imei2?: string | null;
  condition_grade: string;
  purchase_cost_pence: number;
  battery_health?: string | null;
  network_status?: string | null;
  face_id_status?: string | null;
}

interface SellPhoneModalProps {
  isOpen: boolean;
  shiftId?: string | null;
  preselectedUnit?: PhoneUnit | null;
  onClose: () => void;
  onSuccess: (result: {
    invoice_number: string;
    sale_id: string;
    warranty_until: string | null;
    invoiceData: PhoneSaleInvoiceData;
  }) => void;
}

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "OnePlus",
  "Motorola",
  "Huawei",
  "Honor",
  "Oppo",
  "Nothing",
  "Other",
] as const;

const BRAND_MODELS: Record<string, string[]> = {
  Apple: [
    "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
    "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
    "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
    "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13 mini", "iPhone 13",
    "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12 mini", "iPhone 12",
    "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
    "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
    "iPhone SE (3rd Gen)", "iPhone SE (2nd Gen)",
    "iPhone 8 Plus", "iPhone 8",
  ],
  Samsung: [
    "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25",
    "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24 FE", "Galaxy S24",
    "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23 FE", "Galaxy S23",
    "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22",
    "Galaxy S21 Ultra", "Galaxy S21+", "Galaxy S21 FE", "Galaxy S21",
    "Galaxy Z Fold 6", "Galaxy Z Fold 5", "Galaxy Z Fold 4",
    "Galaxy Z Flip 6", "Galaxy Z Flip 5", "Galaxy Z Flip 4",
    "Galaxy A55", "Galaxy A54", "Galaxy A35", "Galaxy A34", "Galaxy A25", "Galaxy A15", "Galaxy A14",
    "Galaxy Note 20 Ultra", "Galaxy Note 20",
  ],
  Google: [
    "Pixel 9 Pro XL", "Pixel 9 Pro Fold", "Pixel 9 Pro", "Pixel 9",
    "Pixel 8 Pro", "Pixel 8a", "Pixel 8",
    "Pixel 7 Pro", "Pixel 7a", "Pixel 7",
    "Pixel 6 Pro", "Pixel 6a", "Pixel 6",
  ],
  Xiaomi: [
    "Xiaomi 14 Ultra", "Xiaomi 14 Pro", "Xiaomi 14",
    "Xiaomi 13 Ultra", "Xiaomi 13 Pro", "Xiaomi 13",
    "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13", "Redmi 13C",
    "POCO X6 Pro", "POCO X6", "POCO F6 Pro", "POCO F6",
  ],
  OnePlus: [
    "OnePlus 12", "OnePlus 12R", "OnePlus 11", "OnePlus 10 Pro", "OnePlus Open",
    "OnePlus Nord 4", "OnePlus Nord CE 4", "OnePlus Nord CE 3",
  ],
  Motorola: [
    "Edge 50 Ultra", "Edge 50 Pro", "Edge 40 Pro", "Edge 40 Neo",
    "Razr 50 Ultra", "Razr 40 Ultra",
    "Moto G84", "Moto G54", "Moto G24",
  ],
  Huawei: [
    "Pura 70 Ultra", "Pura 70 Pro", "Pura 70",
    "P60 Pro", "P50 Pro", "Mate 60 Pro", "Mate 50 Pro", "Nova 12",
  ],
  Honor: [
    "Magic 6 Pro", "Magic 5 Pro", "Magic V2", "Honor 200 Pro", "Honor 200", "Honor 90",
  ],
  Oppo: [
    "Find X8 Pro", "Find X7 Ultra", "Find N3 Flip",
    "Reno 12 Pro", "Reno 12", "A98", "A78",
  ],
  Nothing: [
    "Phone (2a) Plus", "Phone (2a)", "Phone (2)", "Phone (1)",
  ],
};

const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "Other"] as const;

const COLOUR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Green",
  "Red",
  "Purple",
  "Pink",
  "Silver",
  "Gold",
  "Graphite",
  "Space Grey",
  "Natural Titanium",
  "Black Titanium",
  "White Titanium",
  "Blue Titanium",
  "Other",
] as const;

const CONDITION_GRADES = ["New", "Grade A", "Grade B", "Grade C", "Faulty"] as const;
const NETWORK_OPTIONS = ["Unlocked", "EE", "Vodafone", "O2", "Three", "Other"] as const;

const FACE_ID_OPTIONS = [
  { value: "working", label: "Working" },
  { value: "not_working", label: "Not Working" },
  { value: "not_checked", label: "Not Checked" },
] as const;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank", icon: Building2 },
] as const;

const WARRANTY_PRESETS = [
  { value: "none", label: "No Warranty", days: "0" },
  { value: "30", label: "30 Days", days: "30" },
  { value: "90", label: "90 Days", days: "90" },
  { value: "custom", label: "Custom", days: "" },
] as const;

function generateIdemKey() {
  return `sell-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatGBP(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function computePhoneName(brand: string, customBrand: string, model: string): string {
  const actualBrand = brand === "Other" ? (customBrand.trim() || "") : brand.trim();
  const actualModel = model.trim();
  if (!actualModel) return actualBrand;
  if (!actualBrand) return actualModel;
  
  if (actualModel.toLowerCase().startsWith(actualBrand.toLowerCase())) {
    return actualModel;
  }
  return `${actualBrand} ${actualModel}`;
}

export function SellPhoneModal({
  isOpen, shiftId, preselectedUnit, onClose, onSuccess,
}: SellPhoneModalProps) {
  const queryClient = useQueryClient();
  const sellFn = useServerFn(sellPhone);
  const searchUnitsFn = useServerFn(searchPhoneUnits);
  const searchCustomersFn = useServerFn(searchCustomers);
  const saveCustomerFn = useServerFn(saveCustomer);

  // --- Sale Mode ---
  const [saleMode, setSaleMode] = useState<"from_stock" | "direct_sale">(
    preselectedUnit ? "from_stock" : "from_stock",
  );

  // --- From Stock state ---
  const [unitQuery, setUnitQuery] = useState("");
  const [unitResults, setUnitResults] = useState<PhoneUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<PhoneUnit | null>(preselectedUnit ?? null);
  const [unitSearchLoading, setUnitSearchLoading] = useState(false);

  // --- Direct Sale: Structured Device State ---
  const [directBrand, setDirectBrand] = useState<string>("Apple");
  const [customBrand, setCustomBrand] = useState("");
  const [directModel, setDirectModel] = useState("iPhone 15 Pro Max");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [modelHighlightedIndex, setModelHighlightedIndex] = useState(0);

  const [selectedStorage, setSelectedStorage] = useState<string>("128GB");
  const [customStorage, setCustomStorage] = useState("");

  const [selectedColour, setSelectedColour] = useState<string>("Black");
  const [customColour, setCustomColour] = useState("");

  const [directCondition, setDirectCondition] = useState<typeof CONDITION_GRADES[number]>("Grade A");
  const [directImei1, setDirectImei1] = useState("");
  const [imeiDuplicateUnit, setImeiDuplicateUnit] = useState<PhoneUnit | null>(null);

  // Secondary Device Checks
  const [directBatteryHealth, setDirectBatteryHealth] = useState("");
  const [directNetwork, setDirectNetwork] = useState<string>("Unlocked");
  const [customNetwork, setCustomNetwork] = useState("");
  const [faceIdStatus, setFaceIdStatus] = useState<"working" | "not_working" | "not_checked">("not_checked");
  const [directFaults, setDirectFaults] = useState("");
  const [showMoreChecks, setShowMoreChecks] = useState(false);

  // --- Buyer State (Fast direct entry default, secondary customer lookup) ---
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [buyerQuery, setBuyerQuery] = useState("");
  const [buyerResults, setBuyerResults] = useState<{ id: string; name: string; phone?: string | null }[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<{ id: string; name: string; phone?: string | null } | null>(null);
  const [buyerSearchLoading, setBuyerSearchLoading] = useState(false);

  // --- Warranty State (Standardized presets) ---
  const [warrantyType, setWarrantyType] = useState<"none" | "30" | "90" | "custom">("90");
  const [customWarrantyDays, setCustomWarrantyDays] = useState("");
  const [warrantyPolicy, setWarrantyPolicy] = useState("");

  // --- Price & Payment ---
  const [priceGBP, setPriceGBP] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [cashReceivedGBP, setCashReceivedGBP] = useState("");
  const [directCostGBP, setDirectCostGBP] = useState("");

  // --- Notes & Submission Feedback ---
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const modelInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const customerLookupRef = useRef<HTMLDivElement>(null);

  // Sync preselected unit
  useEffect(() => {
    if (preselectedUnit) {
      setSelectedUnit(preselectedUnit);
      setSaleMode("from_stock");
    }
  }, [preselectedUnit]);

  // Is device Apple/iPhone?
  const isApple = directBrand === "Apple" ||
    directModel.toLowerCase().includes("iphone") ||
    directModel.toLowerCase().includes("ipad") ||
    directModel.toLowerCase().includes("apple");

  // Auto-derived phone name
  const derivedPhoneName = computePhoneName(directBrand, customBrand, directModel);

  // Models filtered for current brand & search query
  const availableModels = BRAND_MODELS[directBrand] || [];
  const filteredModels = availableModels.filter((m) => {
    if (!modelSearchQuery.trim()) return true;
    return m.toLowerCase().includes(modelSearchQuery.toLowerCase().trim());
  });

  // Close model dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
      if (
        customerLookupRef.current &&
        !customerLookupRef.current.contains(e.target as Node)
      ) {
        setShowCustomerLookup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBrandChange = (newBrand: string) => {
    setDirectBrand(newBrand);
    if (newBrand !== "Other") {
      setCustomBrand("");
    }
    const modelsForBrand = BRAND_MODELS[newBrand];
    if (modelsForBrand && modelsForBrand.length > 0) {
      setDirectModel(modelsForBrand[0]);
    } else {
      setDirectModel("");
    }
    setModelSearchQuery("");
    setModelDropdownOpen(false);
  };

  const handleSelectModel = (model: string) => {
    setDirectModel(model);
    setModelSearchQuery("");
    setModelDropdownOpen(false);
  };

  // Check 15-digit IMEI for duplicate in stock
  useEffect(() => {
    if (saleMode !== "direct_sale") {
      setImeiDuplicateUnit(null);
      return;
    }
    const cleanImei = directImei1.trim();
    if (cleanImei.length === 15) {
      let active = true;
      searchUnitsFn({ data: { q: cleanImei } })
        .then((res: any) => {
          if (!active) return;
          const match = (res as PhoneUnit[]).find((u) => u.imei1 === cleanImei);
          setImeiDuplicateUnit(match || null);
        })
        .catch(() => {
          if (active) setImeiDuplicateUnit(null);
        });
      return () => { active = false; };
    } else {
      setImeiDuplicateUnit(null);
    }
  }, [directImei1, saleMode, searchUnitsFn]);

  // Handle warranty days calculation
  const effectiveWarrantyDays = warrantyType === "none"
    ? 0
    : warrantyType === "30"
    ? 30
    : warrantyType === "90"
    ? 90
    : (customWarrantyDays.trim() !== "" ? parseInt(customWarrantyDays, 10) : null);

  const resetForm = useCallback(() => {
    setSaleMode(preselectedUnit ? "from_stock" : "from_stock");
    setUnitQuery(""); setUnitResults([]); setSelectedUnit(preselectedUnit ?? null);
    setDirectBrand("Apple"); setCustomBrand("");
    setDirectModel("iPhone 15 Pro Max"); setModelSearchQuery("iPhone 15 Pro Max");
    setSelectedStorage("128GB"); setCustomStorage("");
    setSelectedColour("Black"); setCustomColour("");
    setDirectCondition("Grade A"); setDirectImei1(""); setImeiDuplicateUnit(null);
    setDirectBatteryHealth(""); setDirectNetwork("Unlocked"); setCustomNetwork("");
    setFaceIdStatus("not_checked"); setDirectFaults(""); setShowMoreChecks(false);
    setBuyerName(""); setBuyerPhone(""); setShowCustomerLookup(false);
    setBuyerQuery(""); setBuyerResults([]); setSelectedBuyer(null);
    setWarrantyType("90"); setCustomWarrantyDays(""); setWarrantyPolicy("");
    setPriceGBP(""); setPaymentMethod("cash"); setCashReceivedGBP("");
    setDirectCostGBP(""); setNotes(""); setErrorMsg(null);
  }, [preselectedUnit]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Unit search
  async function handleUnitSearch(q: string) {
    setUnitQuery(q);
    setSelectedUnit(null);
    if (q.trim().length < 2) { setUnitResults([]); return; }
    setUnitSearchLoading(true);
    try {
      const r = await searchUnitsFn({ data: { q } });
      setUnitResults(r as PhoneUnit[]);
    } catch { setUnitResults([]); }
    finally { setUnitSearchLoading(false); }
  }

  // Buyer search
  async function handleBuyerSearch(q: string) {
    setBuyerQuery(q);
    if (q.trim().length < 2) { setBuyerResults([]); return; }
    setBuyerSearchLoading(true);
    try {
      const r = await searchCustomersFn({ data: { q } });
      setBuyerResults(r as any[]);
    } catch { setBuyerResults([]); }
    finally { setBuyerSearchLoading(false); }
  }

  function handleSelectExistingCustomer(c: { id: string; name: string; phone?: string | null }) {
    setSelectedBuyer(c);
    setBuyerName(c.name);
    setBuyerPhone(c.phone || "");
    setShowCustomerLookup(false);
    setBuyerResults([]);
    setBuyerQuery("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Mode-specific validation
    if (saleMode === "from_stock" && !selectedUnit) {
      setErrorMsg("Select a phone unit from stock before processing sale.");
      return;
    }
    if (saleMode === "direct_sale") {
      if (!directModel.trim()) {
        setErrorMsg("Please select or enter a Device Model.");
        return;
      }
      if (directImei1.trim().length !== 15) {
        setErrorMsg("Enter a valid 15-digit numeric IMEI.");
        return;
      }
      if (imeiDuplicateUnit) {
        setErrorMsg(`IMEI already exists in inventory (#${imeiDuplicateUnit.stock_number}). Please sell from stock instead.`);
        return;
      }
    }

    const pricePence = Math.round(parseFloat(priceGBP || "0") * 100);
    if (isNaN(pricePence) || pricePence <= 0) {
      setErrorMsg("Selling price must be greater than £0.00.");
      return;
    }
    if (paymentMethod === "cash" && !shiftId) {
      setErrorMsg("No open till shift. Open the till before taking a cash payment.");
      return;
    }

    const tenderedPence = paymentMethod === "cash" && cashReceivedGBP
      ? Math.round(parseFloat(cashReceivedGBP) * 100)
      : null;

    if (paymentMethod === "cash" && tenderedPence !== null && tenderedPence < pricePence) {
      setErrorMsg(`Cash received (${formatGBP(tenderedPence)}) is less than selling price (${formatGBP(pricePence)}).`);
      return;
    }

    let directCostPence: number | null = null;
    if (directCostGBP && directCostGBP.trim() !== "") {
      const parsedCost = parseFloat(directCostGBP);
      if (isNaN(parsedCost) || parsedCost < 0) {
        setErrorMsg("Cost to business cannot be negative.");
        return;
      }
      directCostPence = Math.round(parsedCost * 100);
    }

    if (effectiveWarrantyDays !== null && (isNaN(effectiveWarrantyDays) || effectiveWarrantyDays < 0)) {
      setErrorMsg("Warranty days must be a non-negative number.");
      return;
    }

    // Resolve final fields
    const finalBrand = directBrand === "Other" ? (customBrand.trim() || "Other") : directBrand;
    const finalModel = directModel.trim();
    const finalStorage = selectedStorage === "Other" ? (customStorage.trim() || null) : selectedStorage;
    const finalColour = selectedColour === "Other" ? (customColour.trim() || null) : selectedColour;
    const finalNetwork = directNetwork === "Other" ? (customNetwork.trim() || "Other") : directNetwork;

    setSubmitting(true);
    try {
      let resolvedBuyerId = selectedBuyer?.id ?? null;
      let resolvedBuyerObj = selectedBuyer;

      // If staff entered direct buyer details and no DB buyer was selected, record buyer details for invoice
      if (!resolvedBuyerId && (buyerName.trim() || buyerPhone.trim())) {
        resolvedBuyerObj = {
          id: "",
          name: buyerName.trim() || "Customer",
          phone: buyerPhone.trim() || null,
        };
      }

      const result = await sellFn({
        data: {
          idempotency_key: generateIdemKey(),
          phone_unit_id: saleMode === "from_stock" ? selectedUnit?.id ?? null : null,
          buyer_customer_id: resolvedBuyerId,
          shift_id: paymentMethod === "cash" ? (shiftId ?? null) : null,
          selling_price_pence: pricePence,
          payment_method: paymentMethod,
          amount_tendered_pence: tenderedPence,
          warranty_days: effectiveWarrantyDays,
          warranty_policy_text: (effectiveWarrantyDays && effectiveWarrantyDays > 0 && warrantyPolicy.trim()) ? warrantyPolicy.trim() : null,
          notes: notes.trim() || null,

          // Direct sale parameters
          brand: saleMode === "direct_sale" ? finalBrand : null,
          model: saleMode === "direct_sale" ? finalModel : null,
          storage: saleMode === "direct_sale" ? finalStorage : null,
          colour: saleMode === "direct_sale" ? finalColour : null,
          imei1: saleMode === "direct_sale" ? directImei1.trim() : null,
          condition_grade: saleMode === "direct_sale" ? directCondition : "Grade A",
          condition_notes: saleMode === "direct_sale" ? (directFaults.trim() || null) : null,
          battery_health: saleMode === "direct_sale" && directBatteryHealth.trim()
            ? (directBatteryHealth.includes("%") ? directBatteryHealth.trim() : `${directBatteryHealth.trim()}%`)
            : null,
          network_status: saleMode === "direct_sale" ? finalNetwork : null,
          cost_price_pence: saleMode === "direct_sale" ? directCostPence : null,
        },
      });

      const soldAtIso = new Date().toISOString();
      toastSuccess(`✅ Sold! Invoice #${result.invoice_number}`);
      queryClient.invalidateQueries({ queryKey: ["phone-units"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      const deviceSnapshot = saleMode === "from_stock" && selectedUnit
        ? {
            brand: selectedUnit.brand,
            model: selectedUnit.model,
            storage: selectedUnit.storage,
            colour: selectedUnit.colour,
            imei1: selectedUnit.imei1,
            condition_grade: selectedUnit.condition_grade,
            stock_number: selectedUnit.stock_number,
            battery_health: selectedUnit.battery_health,
            network_status: selectedUnit.network_status,
            face_id_status: selectedUnit.face_id_status ?? null,
          }
        : {
            brand: finalBrand,
            model: finalModel,
            storage: finalStorage,
            colour: finalColour,
            imei1: directImei1.trim(),
            condition_grade: directCondition,
            condition_notes: directFaults.trim() || null,
            battery_health: directBatteryHealth.trim()
              ? (directBatteryHealth.includes("%") ? directBatteryHealth.trim() : `${directBatteryHealth.trim()}%`)
              : null,
            network_status: finalNetwork,
            face_id_status: isApple ? faceIdStatus : null,
            stock_number: null,
          };

      onSuccess({
        invoice_number: result.invoice_number,
        sale_id: result.sale_id,
        warranty_until: result.warranty_until,
        invoiceData: {
          invoice_number: result.invoice_number,
          sold_at: soldAtIso,
          buyer: resolvedBuyerObj?.name ? resolvedBuyerObj : null,
          device_snapshot: deviceSnapshot,
          selling_price_pence: pricePence,
          payment_method: paymentMethod,
          warranty_days: effectiveWarrantyDays,
          warranty_policy_text: (effectiveWarrantyDays && effectiveWarrantyDays > 0 && warrantyPolicy.trim()) ? warrantyPolicy.trim() : null,
          warranty_until: result.warranty_until,
          notes: notes.trim() || null,
        },
      });
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process sale. Please try again.");
      toastError(err, "Failed to process phone sale");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const pricePence = Math.round(parseFloat(priceGBP || "0") * 100);
  const cashReceivedPence = cashReceivedGBP ? Math.round(parseFloat(cashReceivedGBP) * 100) : null;
  const changeDuePence = (cashReceivedPence !== null && pricePence > 0) ? Math.max(cashReceivedPence - pricePence, 0) : null;

  // Live Internal Cost, Profit & Margin calculation
  let costPence: number | null = null;
  if (saleMode === "from_stock" && selectedUnit) {
    costPence = selectedUnit.purchase_cost_pence;
  } else if (saleMode === "direct_sale" && directCostGBP && !isNaN(parseFloat(directCostGBP))) {
    costPence = Math.round(parseFloat(directCostGBP) * 100);
  }

  const grossProfitPence = (pricePence > 0 && costPence !== null) ? pricePence - costPence : null;
  const marginPercent = (pricePence > 0 && grossProfitPence !== null)
    ? ((grossProfitPence / pricePence) * 100).toFixed(1)
    : null;

  // Live Summary Strings
  const summaryDeviceTitle = saleMode === "from_stock" && selectedUnit
    ? `${selectedUnit.brand} ${selectedUnit.model}`
    : (derivedPhoneName || "Handset");

  const summarySpecs = saleMode === "from_stock" && selectedUnit
    ? [selectedUnit.storage, selectedUnit.colour, selectedUnit.condition_grade].filter(Boolean).join(" · ")
    : [selectedStorage, selectedColour, directCondition].filter(Boolean).join(" · ");

  const summaryImeiEnding = saleMode === "from_stock" && selectedUnit
    ? (selectedUnit.imei1 ? `IMEI ending •••• ${selectedUnit.imei1.slice(-4)}` : "")
    : (directImei1.trim().length >= 4 ? `IMEI •••• ${directImei1.trim().slice(-4)}` : (directImei1.trim() ? `IMEI: ${directImei1.trim()}` : "IMEI Pending"));

  const summaryBuyerDisplay = buyerName.trim()
    ? `${buyerName.trim()}${buyerPhone.trim() ? ` · ${buyerPhone.trim()}` : ""}`
    : "Walk-in Customer";

  const summaryWarrantyDisplay = effectiveWarrantyDays === 0
    ? "No Warranty"
    : (effectiveWarrantyDays !== null ? `${effectiveWarrantyDays} Days` : "Not Specified");

  // Primary CTA Validation State
  const isFormValid = saleMode === "from_stock"
    ? !!selectedUnit && pricePence > 0 && (paymentMethod !== "cash" || (!!shiftId && (cashReceivedPence === null || cashReceivedPence >= pricePence)))
    : directBrand.trim().length > 0 && directModel.trim().length > 0 && directImei1.trim().length === 15 && pricePence > 0 && (paymentMethod !== "cash" || (!!shiftId && (cashReceivedPence === null || cashReceivedPence >= pricePence))) && !imeiDuplicateUnit;

  const inputCls = "w-full px-2.5 py-1 bg-background border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#AC313F]/30 focus:border-[#AC313F] placeholder:text-muted-foreground/60 transition-all h-[32px]";
  const labelCls = "block text-[10px] font-extrabold text-muted-foreground mb-1 uppercase tracking-wider";
  const sectionHeadCls = "text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-border/80";

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen max-h-screen bg-background flex flex-col overflow-hidden animate-in fade-in duration-150">

      {/* ── TOP HEADER (h-12 shrink-0) ── */}
      <header className="h-12 px-4 sm:px-6 border-b border-border bg-card flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#AC313F]/10 text-[#AC313F] flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <h1 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
              Sell Phone
            </h1>
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Accessible Segmented Radio Pills */}
          <div
            role="radiogroup"
            aria-label="Phone Source"
            className="inline-flex items-center p-0.5 bg-muted/60 rounded-lg border border-border text-xs"
          >
            <button
              type="button"
              role="radio"
              aria-checked={saleMode === "from_stock"}
              tabIndex={0}
              onClick={() => setSaleMode("from_stock")}
              className={`py-1 px-3 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                saleMode === "from_stock"
                  ? "bg-[#AC313F] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>Sell From Stock</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={saleMode === "direct_sale"}
              tabIndex={0}
              onClick={() => {
                setSaleMode("direct_sale");
                setTimeout(() => modelInputRef.current?.focus(), 50);
              }}
              className={`py-1 px-3 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                saleMode === "direct_sale"
                  ? "bg-[#AC313F] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Direct Phone Sale</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* ── 3-COLUMN WORKSPACE FORM ── */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/15">

        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-[11px] hover:underline cursor-pointer opacity-80 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── BODY ── */}
        <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto lg:overflow-y-hidden no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3 min-h-0">

          {/* ═══════════════════════════════════════════════════════════
              COLUMN 1: DEVICE / STOCK SELECTION
             ═══════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs flex flex-col gap-2 min-h-0 overflow-y-auto no-scrollbar">
            <div className={sectionHeadCls}>
              <Smartphone className="w-3.5 h-3.5 text-[#AC313F]" />
              <span>{saleMode === "from_stock" ? "Select Stock Handset" : "Device Information"}</span>
            </div>

            {/* ──── SELL FROM STOCK MODE ──── */}
            {saleMode === "from_stock" && (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                {selectedUnit ? (
                  /* Confirmation Card: Replaces Search Area */
                  <div className="p-3 bg-card border-2 border-[#AC313F]/30 rounded-xl space-y-2.5 shadow-xs animate-in zoom-in-95 duration-150">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/70">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#AC313F] bg-[#AC313F]/10 px-1.5 py-0.5 rounded">
                            Selected Handset
                          </span>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">
                            #{selectedUnit.stock_number}
                          </span>
                        </div>
                        <h2 className="text-sm font-extrabold text-foreground mt-1">
                          {selectedUnit.brand} {selectedUnit.model}
                        </h2>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {[selectedUnit.storage, selectedUnit.colour, selectedUnit.condition_grade].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedUnit(null); setUnitQuery(""); }}
                        className="px-2.5 py-1 text-xs font-bold text-[#AC313F] bg-[#AC313F]/10 hover:bg-[#AC313F]/20 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        Change handset
                      </button>
                    </div>

                    {/* Compact Specs Grid */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/60">
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">IMEI</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedUnit.imei1 ? `•••••••••••${selectedUnit.imei1.slice(-4)}` : "None"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Condition</span>
                        <span className="font-bold text-foreground">{selectedUnit.condition_grade}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Battery</span>
                        <span className="font-medium text-foreground">{selectedUnit.battery_health || "Not checked"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Network</span>
                        <span className="font-medium text-foreground">{selectedUnit.network_status || "Unlocked"}</span>
                      </div>
                      {selectedUnit.face_id_status && (
                        <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Face ID</span>
                          <span className="font-semibold text-foreground capitalize">{selectedUnit.face_id_status.replace("_", " ")}</span>
                        </div>
                      )}
                      {selectedUnit.condition_grade.toLowerCase().includes("new") && selectedUnit.battery_health && parseInt(selectedUnit.battery_health, 10) > 0 && parseInt(selectedUnit.battery_health, 10) < 95 && (
                        <div className="col-span-2 p-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Brand New selected but Battery Health is {selectedUnit.battery_health}. Please confirm condition.</span>
                        </div>
                      )}
                    </div>

                    {/* Internal Acquisition Cost */}
                    <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Acquisition Cost:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono font-bold text-foreground">{formatGBP(selectedUnit.purchase_cost_pence)}</strong>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1 py-0.5 rounded bg-muted">
                          Internal
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active Search Input & Results */
                  <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search stock #, IMEI, brand or model…"
                        value={unitQuery}
                        onChange={(e) => handleUnitSearch(e.target.value)}
                        className={`${inputCls} !pl-8 text-xs`}
                        autoFocus
                      />
                      {unitSearchLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {/* Rich Stock Search Results List */}
                    {unitResults.length > 0 ? (
                      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border shadow-xs max-h-80 overflow-y-auto no-scrollbar">
                        {unitResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUnit(u); setUnitResults([]); setUnitQuery(""); }}
                            className="w-full text-left p-2.5 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between gap-2.5 group"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-xs font-extrabold text-foreground block truncate group-hover:text-[#AC313F] transition-colors">
                                {u.brand} {u.model}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-semibold block">
                                {[u.storage, u.colour, u.condition_grade].filter(Boolean).join(" · ")}
                              </span>
                              <div className="text-[10px] font-mono text-muted-foreground pt-0.5 flex items-center gap-2">
                                <span className="font-bold text-foreground/80">Stock #{u.stock_number}</span>
                                <span>·</span>
                                <span>IMEI •••• {u.imei1 ? u.imei1.slice(-4) : "—"}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/80">
                                {u.condition_grade}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                                Cost {formatGBP(u.purchase_cost_pence)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : unitQuery.trim().length >= 2 && !unitSearchLoading ? (
                      /* Zero Results State */
                      <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border text-xs text-muted-foreground my-auto">
                        <p className="font-bold text-foreground">No stock phones found for "{unitQuery}".</p>
                        <p className="text-[11px] mt-0.5">Check spelling or sell as a direct phone sale.</p>
                        <button
                          type="button"
                          onClick={() => setSaleMode("direct_sale")}
                          className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#AC313F] hover:underline cursor-pointer bg-[#AC313F]/10 px-2.5 py-1 rounded-md"
                        >
                          <span>Switch to Direct Phone Sale</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Clean Empty Search Prompt */
                      <div className="p-5 rounded-xl border border-dashed border-border/80 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 my-auto bg-muted/5">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-foreground">Search Stock Inventory</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">
                            Start typing an IMEI, stock number, brand or model to select a handset.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ──── DIRECT PHONE SALE MODE ──── */}
            {saleMode === "direct_sale" && (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">

                {/* 1. Brand & Searchable Model Combobox */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className={labelCls}>Brand *</label>
                    <select
                      value={directBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className={inputCls}
                    >
                      {BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {directBrand === "Other" && (
                      <input
                        type="text"
                        placeholder="Custom Brand"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className={`${inputCls} mt-1`}
                      />
                    )}
                  </div>

                  <div className="relative" ref={modelDropdownRef}>
                    <label className={labelCls}>Model *</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-muted-foreground/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={modelInputRef}
                        type="text"
                        placeholder={directBrand === "Other" ? "Enter model…" : `Search ${directBrand} model…`}
                        value={modelDropdownOpen ? modelSearchQuery : directModel}
                        onFocus={() => {
                          setModelSearchQuery("");
                          setModelHighlightedIndex(0);
                          setModelDropdownOpen(true);
                        }}
                        onChange={(e) => {
                          setModelSearchQuery(e.target.value);
                          setModelHighlightedIndex(0);
                          if (!modelDropdownOpen) setModelDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (!modelDropdownOpen) {
                            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                              e.preventDefault();
                              setModelDropdownOpen(true);
                              return;
                            }
                          }
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setModelHighlightedIndex((prev) => Math.min(prev + 1, filteredModels.length));
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setModelHighlightedIndex((prev) => Math.max(prev - 1, 0));
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (modelDropdownOpen) {
                              if (modelHighlightedIndex < filteredModels.length) {
                                handleSelectModel(filteredModels[modelHighlightedIndex]);
                              } else if (modelSearchQuery.trim()) {
                                handleSelectModel(modelSearchQuery.trim());
                              } else {
                                setModelDropdownOpen(false);
                              }
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setModelDropdownOpen(false);
                            setModelSearchQuery("");
                          } else if (e.key === "Tab") {
                            setModelDropdownOpen(false);
                          }
                        }}
                        className={`${inputCls} !pl-8 !pr-14 font-medium`}
                        required
                      />

                      {/* Clear button (×) & Chevron Toggle */}
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        {(modelDropdownOpen ? modelSearchQuery : directModel) ? (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDirectModel("");
                              setModelSearchQuery("");
                              setModelDropdownOpen(true);
                              modelInputRef.current?.focus();
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
                            title="Clear model"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (modelDropdownOpen) {
                              setModelDropdownOpen(false);
                            } else {
                              setModelSearchQuery("");
                              setModelDropdownOpen(true);
                              modelInputRef.current?.focus();
                            }
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${modelDropdownOpen ? "rotate-180 text-foreground" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Searchable Combobox Dropdown */}
                    {modelDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-card border border-border rounded-xl shadow-xl max-h-[290px] overflow-y-auto divide-y divide-border/60 animate-in fade-in zoom-in-95 duration-100 no-scrollbar"
                      >
                        {/* Preset Models List */}
                        <div className="p-1 space-y-0.5">
                          {filteredModels.length > 0 ? (
                            filteredModels.map((m, idx) => {
                              const isSelected = directModel.toLowerCase() === m.toLowerCase();
                              const isHighlighted = idx === modelHighlightedIndex;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => handleSelectModel(m)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? "bg-[#AC313F]/10 text-[#AC313F] font-bold"
                                      : isHighlighted
                                      ? "bg-muted text-foreground font-semibold"
                                      : "hover:bg-muted/60 text-foreground font-medium"
                                  }`}
                                >
                                  <span>{m}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#AC313F] shrink-0" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              No matching {directBrand} preset models.
                            </div>
                          )}
                        </div>

                        {/* Bottom Action: Model Not Listed / Custom Model */}
                        <div className="p-1 bg-muted/20">
                          <button
                            type="button"
                            onClick={() => {
                              if (modelSearchQuery.trim()) {
                                handleSelectModel(modelSearchQuery.trim());
                              } else {
                                setDirectModel("");
                                setModelSearchQuery("");
                                modelInputRef.current?.focus();
                                setModelDropdownOpen(false);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                              modelHighlightedIndex === filteredModels.length
                                ? "bg-[#AC313F]/15 text-[#AC313F]"
                                : "text-[#AC313F] hover:bg-[#AC313F]/10"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {modelSearchQuery.trim()
                                ? `Use "${modelSearchQuery.trim()}" (Model not listed)`
                                : "+ Model not listed"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-derived Phone Name display */}
                <div className="px-2.5 py-1 bg-muted/30 border border-border/60 rounded-md flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Generated Name:</span>
                  <span className="font-extrabold text-foreground truncate max-w-[200px]">{derivedPhoneName || "Handset"}</span>
                </div>

                {/* 2. Storage & Colour */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className={labelCls}>Storage *</label>
                    <select
                      value={selectedStorage}
                      onChange={(e) => setSelectedStorage(e.target.value)}
                      className={inputCls}
                    >
                      {STORAGE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {selectedStorage === "Other" && (
                      <input
                        type="text"
                        placeholder="e.g. 16GB"
                        value={customStorage}
                        onChange={(e) => setCustomStorage(e.target.value)}
                        className={`${inputCls} mt-1`}
                      />
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Colour *</label>
                    <select
                      value={selectedColour}
                      onChange={(e) => setSelectedColour(e.target.value)}
                      className={inputCls}
                    >
                      {COLOUR_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {selectedColour === "Other" && (
                      <input
                        type="text"
                        placeholder="Custom Colour"
                        value={customColour}
                        onChange={(e) => setCustomColour(e.target.value)}
                        className={`${inputCls} mt-1`}
                      />
                    )}
                  </div>
                </div>

                {/* 3. Condition Radio Group */}
                <div>
                  <label className={labelCls}>Condition *</label>
                  <div
                    role="radiogroup"
                    aria-label="Device Condition"
                    className="grid grid-cols-5 gap-1"
                  >
                    {CONDITION_GRADES.map((cg) => (
                      <button
                        key={cg}
                        type="button"
                        role="radio"
                        aria-checked={directCondition === cg}
                        tabIndex={directCondition === cg ? 0 : -1}
                        onClick={() => setDirectCondition(cg)}
                        className={`py-1 text-center text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          directCondition === cg
                            ? "bg-[#AC313F] text-white border-[#AC313F] shadow-xs"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        }`}
                      >
                        {cg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Primary IMEI with Digits-Only & 15-digit Strict Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Primary IMEI (15 Digits) *</label>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                      directImei1.trim().length === 15
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30"
                        : directImei1.trim().length > 0
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground bg-muted/60"
                    }`}>
                      {directImei1.trim().length === 15 ? "✓ 15/15 digits" : `${directImei1.trim().length}/15`}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Scan or enter 15-digit IMEI…"
                    value={directImei1}
                    onChange={(e) => {
                      // Digits only enforcement
                      const digits = e.target.value.replace(/\D/g, "");
                      setDirectImei1(digits);
                    }}
                    className={`${inputCls} font-mono ${directImei1.length === 15 ? "border-emerald-500/50" : ""}`}
                    required
                  />

                  {/* Duplicate IMEI Alert */}
                  {imeiDuplicateUnit && (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start justify-between gap-1.5 animate-in fade-in">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold leading-tight">Already in inventory (#{imeiDuplicateUnit.stock_number})</p>
                          <p className="text-[11px] opacity-90">{imeiDuplicateUnit.brand} {imeiDuplicateUnit.model} · {imeiDuplicateUnit.condition_grade}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnit(imeiDuplicateUnit);
                          setSaleMode("from_stock");
                        }}
                        className="text-[10px] font-black underline hover:no-underline cursor-pointer shrink-0 text-[#AC313F]"
                      >
                        Sell from stock →
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Device Checks Group */}
                <div className="p-2.5 bg-muted/20 border border-border/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">Device Checks</span>
                    <button
                      type="button"
                      onClick={() => setShowMoreChecks(!showMoreChecks)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{showMoreChecks ? "Less checks" : "More checks"}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showMoreChecks ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className={labelCls}>Battery Health</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g. 92"
                          value={directBatteryHealth}
                          onChange={(e) => setDirectBatteryHealth(e.target.value)}
                          className={`${inputCls} pr-6`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                          %
                        </span>
                      </div>
                      {directCondition === "New" && directBatteryHealth && parseInt(directBatteryHealth, 10) > 0 && parseInt(directBatteryHealth, 10) < 95 && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-md p-1.5 font-semibold mt-1 leading-tight flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Brand New selected but Battery Health is {directBatteryHealth}%. Please confirm condition.</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Network Status</label>
                      <select
                        value={directNetwork}
                        onChange={(e) => setDirectNetwork(e.target.value)}
                        className={inputCls}
                      >
                        {NETWORK_OPTIONS.map((net) => (
                          <option key={net} value={net}>{net}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isApple && (
                    <div>
                      <label className={labelCls}>Face ID Status</label>
                      <div
                        role="radiogroup"
                        aria-label="Face ID Status"
                        className="grid grid-cols-3 gap-1"
                      >
                        {FACE_ID_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={faceIdStatus === opt.value}
                            tabIndex={faceIdStatus === opt.value ? 0 : -1}
                            onClick={() => setFaceIdStatus(opt.value)}
                            className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                              faceIdStatus === opt.value
                                ? "bg-[#AC313F] text-white border-[#AC313F]"
                                : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsible More Checks */}
                  {showMoreChecks && (
                    <div className="pt-1.5 border-t border-border/60 space-y-1.5 animate-in fade-in duration-150">
                      <div>
                        <label className={labelCls}>Disclosed Faults / Cosmetic Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Minor frame marks, speaker clean…"
                          value={directFaults}
                          onChange={(e) => setDirectFaults(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              COLUMN 2: PRICE & PAYMENT + BUYER & WARRANTY
             ═══════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs flex flex-col gap-2.5 min-h-0 overflow-y-auto no-scrollbar">
            
            {/* Price & Payment */}
            <div className="space-y-2">
              <div className={sectionHeadCls}>
                <Banknote className="w-3.5 h-3.5 text-[#AC313F]" />
                <span>Price & Payment</span>
              </div>

              {/* Selling Price */}
              <div>
                <label className={labelCls}>Selling Price (£) *</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base font-black text-foreground pointer-events-none">
                    £
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceGBP}
                    onChange={(e) => setPriceGBP(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} !pl-6 font-mono font-black text-base !h-[38px] focus:border-[#AC313F]`}
                    required
                  />
                </div>
              </div>

              {/* Standardized Payment Method (Mutually Exclusive) */}
              <div>
                <label className={labelCls}>Payment Method *</label>
                <div
                  role="radiogroup"
                  aria-label="Payment Method"
                  className="grid grid-cols-3 gap-1.5"
                >
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={paymentMethod === value}
                      tabIndex={paymentMethod === value ? 0 : -1}
                      onClick={() => setPaymentMethod(value as any)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        paymentMethod === value
                          ? "bg-[#AC313F] text-white border-[#AC313F] shadow-xs"
                          : "bg-muted/20 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-0.5 shrink-0" />
                      <span className="truncate leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Denominations & Tender (Shown ONLY when Cash is selected) */}
              {paymentMethod === "cash" && (
                <div className="p-2.5 bg-muted/25 border border-border rounded-xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">Cash Tender</span>
                    {pricePence > 0 && (
                      <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                        Due: {formatGBP(pricePence)}
                      </span>
                    )}
                  </div>

                  {/* Fast Denomination Shortcuts */}
                  <div className="grid grid-cols-5 gap-1">
                    {["Exact", "10", "20", "50", "100"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          if (val === "Exact") {
                            setCashReceivedGBP(priceGBP || "0");
                          } else {
                            setCashReceivedGBP(val);
                          }
                        }}
                        className="h-6 rounded bg-card border border-border hover:bg-muted text-foreground font-bold text-[11px] cursor-pointer transition-colors"
                      >
                        {val === "Exact" ? "Exact" : `£${val}`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Cash Received</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">£</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cashReceivedGBP}
                          onChange={(e) => setCashReceivedGBP(e.target.value)}
                          placeholder="0.00"
                          className={`${inputCls} !pl-5 font-mono font-bold`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Change Due</span>
                      <div className="h-[32px] px-2 rounded-lg bg-card border border-border flex items-center justify-end font-mono font-black text-sm text-[#AC313F]">
                        {changeDuePence !== null ? formatGBP(changeDuePence) : "£0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Acquisition Cost & Profit / Margin */}
              <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Profit & Margin (Internal Only)
                  </span>
                  <span className="text-[9px] font-bold uppercase text-muted-foreground/80 px-1 py-0.5 rounded bg-muted">
                    Confidential
                  </span>
                </div>

                {saleMode === "direct_sale" ? (
                  <div>
                    <label className={labelCls}>Cost to Business (£)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">£</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={directCostGBP}
                        onChange={(e) => setDirectCostGBP(e.target.value)}
                        placeholder="e.g. 420.00"
                        className={`${inputCls} !pl-5 font-mono`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Stock Unit Cost:</span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedUnit ? formatGBP(selectedUnit.purchase_cost_pence) : "Select unit"}
                    </span>
                  </div>
                )}

                {costPence !== null && pricePence > 0 && (
                  <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Gross Profit</span>
                      <span className={`font-mono font-black ${grossProfitPence !== null && grossProfitPence >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                        {grossProfitPence !== null ? formatGBP(grossProfitPence) : "£0.00"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Margin</span>
                      <span className="font-mono font-bold text-foreground">
                        {marginPercent !== null ? `${marginPercent}%` : "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer & Warranty */}
            <div className="space-y-2.5 pt-2 border-t border-border/80">
              
              {/* Buyer - Fast Direct Inputs with Secondary Customer Lookup */}
              <div className="relative" ref={customerLookupRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-[#AC313F]" /> Buyer — Optional
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomerLookup(!showCustomerLookup)}
                    className="text-[10px] font-bold text-[#AC313F] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <Search className="w-2.5 h-2.5" /> Find existing customer
                  </button>
                </div>

                {/* Direct Name & Phone Inputs (Always visible for quick counter typing) */}
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={buyerName}
                    onChange={(e) => {
                      setBuyerName(e.target.value);
                      if (selectedBuyer && e.target.value !== selectedBuyer.name) {
                        setSelectedBuyer(null);
                      }
                    }}
                    className={inputCls}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    value={buyerPhone}
                    onChange={(e) => {
                      setBuyerPhone(e.target.value);
                      if (selectedBuyer && e.target.value !== selectedBuyer.phone) {
                        setSelectedBuyer(null);
                      }
                    }}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                {selectedBuyer && (
                  <div className="mt-1 px-2 py-0.5 rounded bg-[#AC313F]/10 text-[#AC313F] text-[10px] font-bold flex items-center justify-between">
                    <span>Linked to Customer ID: {selectedBuyer.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBuyer(null)}
                      className="hover:underline cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                )}

                {/* Secondary Customer Search Overlay */}
                {showCustomerLookup && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-card border border-border rounded-xl shadow-2xl p-2 space-y-2 animate-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-foreground">Search Customer Database</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomerLookup(false)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search name or phone…"
                        value={buyerQuery}
                        onChange={(e) => handleBuyerSearch(e.target.value)}
                        className={`${inputCls} !pl-7 text-xs`}
                        autoFocus
                      />
                      {buyerSearchLoading && (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {buyerResults.length > 0 && (
                      <div className="divide-y divide-border/60 max-h-36 overflow-y-auto rounded-lg border border-border/60 bg-muted/20">
                        {buyerResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectExistingCustomer(c)}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-card transition-colors text-xs cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-bold text-foreground">{c.name}</span>
                            {c.phone && <span className="font-mono text-muted-foreground text-[10px]">{c.phone}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Standardized Explicit Warranty Control */}
              <div>
                <label className={labelCls}>Warranty</label>
                <div
                  role="radiogroup"
                  aria-label="Warranty Selection"
                  className="grid grid-cols-4 gap-1 mb-1.5"
                >
                  {WARRANTY_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      role="radio"
                      aria-checked={warrantyType === p.value}
                      tabIndex={warrantyType === p.value ? 0 : -1}
                      onClick={() => setWarrantyType(p.value as any)}
                      className={`py-1 text-center text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        warrantyType === p.value
                          ? "bg-[#AC313F] text-white border-[#AC313F] shadow-xs"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Days Input */}
                {warrantyType === "custom" && (
                  <div className="flex items-center gap-1.5 mt-1 animate-in fade-in">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 60"
                      value={customWarrantyDays}
                      onChange={(e) => setCustomWarrantyDays(e.target.value)}
                      className={`${inputCls} max-w-[100px] font-mono`}
                      autoFocus
                    />
                    <span className="text-xs text-muted-foreground font-semibold">days warranty</span>
                  </div>
                )}

                {/* Policy note if warranty active */}
                {effectiveWarrantyDays !== null && effectiveWarrantyDays > 0 && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={warrantyPolicy}
                      onChange={(e) => setWarrantyPolicy(e.target.value)}
                      placeholder="Policy note (e.g. Covers hardware faults. Excludes damage)"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div>
                <label className={labelCls}>Internal Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Counter notes / reference…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputCls}
                />
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              COLUMN 3: LIVE SALE SUMMARY (CONTENT-DRIVEN, ZERO WASTE)
             ═══════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 min-h-0 overflow-y-auto no-scrollbar">
            <div className={sectionHeadCls}>
              <Receipt className="w-3.5 h-3.5 text-[#AC313F]" />
              <span>Sale Summary</span>
            </div>

            {/* Handset Details Card */}
            <div className="p-2.5 bg-muted/20 border border-border/70 rounded-xl space-y-1">
              <p className="font-extrabold text-sm text-foreground leading-tight">
                {summaryDeviceTitle}
              </p>
              <p className="text-xs text-muted-foreground font-semibold leading-tight">
                {summarySpecs}
              </p>
              {summaryImeiEnding && (
                <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
                  {summaryImeiEnding}
                </p>
              )}
              {saleMode === "from_stock" && selectedUnit && (
                <p className="text-[10px] font-mono text-muted-foreground">
                  Stock #{selectedUnit.stock_number}
                </p>
              )}
            </div>

            {/* Structured Transaction Key/Values */}
            <div className="space-y-1.5 text-xs border border-border/70 rounded-xl p-2.5 bg-card">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-medium">Buyer</span>
                <span className="font-bold text-foreground truncate max-w-[160px]">{summaryBuyerDisplay}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-medium">Payment</span>
                <span className="font-bold text-foreground capitalize">{paymentMethod.replace("_", " ")}</span>
              </div>
              {paymentMethod === "cash" && cashReceivedPence !== null && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Tendered</span>
                  <span className="font-mono text-foreground">{formatGBP(cashReceivedPence)}</span>
                </div>
              )}
              {paymentMethod === "cash" && changeDuePence !== null && changeDuePence > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Change Due</span>
                  <span className="font-mono font-bold text-[#AC313F]">{formatGBP(changeDuePence)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-medium">Warranty</span>
                <span className="font-semibold text-foreground">{summaryWarrantyDisplay}</span>
              </div>
            </div>

            {/* Financial Summary & Dominant Total */}
            <div className="pt-2 border-t border-border/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-medium">Selling Price</span>
                <span className="font-mono font-bold text-foreground">
                  {pricePence > 0 ? formatGBP(pricePence) : "£0.00"}
                </span>
              </div>

              {/* Dominant Total Box */}
              <div className="p-3 bg-[#AC313F]/5 border border-[#AC313F]/20 rounded-xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">TOTAL:</span>
                <span className="text-xl font-mono font-black text-[#AC313F]">
                  {pricePence > 0 ? formatGBP(pricePence) : "£0.00"}
                </span>
              </div>

              {/* Confidential Internal Cost & Profit Box */}
              <div className="p-2 rounded-lg text-xs bg-[#F7F7F7] border border-[#E5E5E5] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Internal Reference</span>
                  <span className="font-mono text-[9px] opacity-75">Not on invoice</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Cost: <strong>{costPence !== null ? formatGBP(costPence) : "—"}</strong></span>
                  <span className="text-foreground">Profit: <strong className={grossProfitPence !== null && grossProfitPence >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>{grossProfitPence !== null ? formatGBP(grossProfitPence) : "—"}</strong> {marginPercent !== null ? `(${marginPercent}%)` : ""}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── FIXED STICKY FOOTER (h-14 shrink-0) ── */}
        <footer className="h-14 px-4 sm:px-6 border-t border-border bg-card flex items-center justify-between shrink-0 shadow-md z-20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {paymentMethod === "cash" && !shiftId && (
              <span className="text-destructive font-bold flex items-center gap-1 px-2 py-0.5 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Till shift not open (Required for cash)
              </span>
            )}
            {saleMode === "direct_sale" && directImei1.length > 0 && directImei1.length < 15 && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Primary IMEI requires 15 digits
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer min-h-[38px] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={`px-6 py-1.5 text-xs font-black rounded-lg shadow-sm transition-all cursor-pointer min-h-[38px] flex items-center gap-2 tracking-wide ${
                isFormValid && !submitting
                  ? "bg-[#AC313F] text-white hover:bg-[#AC313F]/90 active:scale-[0.99]"
                  : "bg-muted text-muted-foreground/60 border border-border cursor-not-allowed opacity-70"
              }`}
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{submitting ? "Processing…" : "SELL & PRINT INVOICE"}</span>
            </button>
          </div>
        </footer>

      </form>

    </div>
  );
}
