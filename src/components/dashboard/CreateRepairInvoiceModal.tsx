import { useState, useRef, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createQuickRepairInvoice } from "@/lib/repairs.functions";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Search,
  Printer,
  Wrench,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ── Device models catalog ───────────────────────────────────────────────────
const DEVICE_MODELS: Array<{ brand: string; model: string }> = [
  // Apple iPhone
  { brand: "Apple", model: "iPhone 16 Pro Max" },
  { brand: "Apple", model: "iPhone 16 Pro" },
  { brand: "Apple", model: "iPhone 16 Plus" },
  { brand: "Apple", model: "iPhone 16" },
  { brand: "Apple", model: "iPhone 15 Pro Max" },
  { brand: "Apple", model: "iPhone 15 Pro" },
  { brand: "Apple", model: "iPhone 15 Plus" },
  { brand: "Apple", model: "iPhone 15" },
  { brand: "Apple", model: "iPhone 14 Pro Max" },
  { brand: "Apple", model: "iPhone 14 Pro" },
  { brand: "Apple", model: "iPhone 14 Plus" },
  { brand: "Apple", model: "iPhone 14" },
  { brand: "Apple", model: "iPhone 13 Pro Max" },
  { brand: "Apple", model: "iPhone 13 Pro" },
  { brand: "Apple", model: "iPhone 13 Mini" },
  { brand: "Apple", model: "iPhone 13" },
  { brand: "Apple", model: "iPhone 12 Pro Max" },
  { brand: "Apple", model: "iPhone 12 Pro" },
  { brand: "Apple", model: "iPhone 12 Mini" },
  { brand: "Apple", model: "iPhone 12" },
  { brand: "Apple", model: "iPhone 11 Pro Max" },
  { brand: "Apple", model: "iPhone 11 Pro" },
  { brand: "Apple", model: "iPhone 11" },
  { brand: "Apple", model: "iPhone XS Max" },
  { brand: "Apple", model: "iPhone XS" },
  { brand: "Apple", model: "iPhone XR" },
  { brand: "Apple", model: "iPhone X" },
  { brand: "Apple", model: "iPhone SE (3rd Gen)" },
  { brand: "Apple", model: "iPhone SE (2nd Gen)" },
  { brand: "Apple", model: "iPhone 8 Plus" },
  { brand: "Apple", model: "iPhone 8" },
  { brand: "Apple", model: "iPhone 7 Plus" },
  { brand: "Apple", model: "iPhone 7" },
  // Apple iPad & Mac
  { brand: "Apple", model: "iPad Pro 13\" (M4)" },
  { brand: "Apple", model: "iPad Pro 11\" (M4)" },
  { brand: "Apple", model: "iPad Air 13\" (M2)" },
  { brand: "Apple", model: "iPad Air 11\" (M2)" },
  { brand: "Apple", model: "iPad Mini (6th Gen)" },
  { brand: "Apple", model: "iPad (10th Gen)" },
  { brand: "Apple", model: "iPad (9th Gen)" },
  { brand: "Apple", model: "MacBook Pro 16\"" },
  { brand: "Apple", model: "MacBook Pro 14\"" },
  { brand: "Apple", model: "MacBook Air 15\"" },
  { brand: "Apple", model: "MacBook Air 13\"" },
  // Samsung Galaxy S
  { brand: "Samsung", model: "Samsung Galaxy S25 Ultra" },
  { brand: "Samsung", model: "Samsung Galaxy S25+" },
  { brand: "Samsung", model: "Samsung Galaxy S25" },
  { brand: "Samsung", model: "Samsung Galaxy S24 Ultra" },
  { brand: "Samsung", model: "Samsung Galaxy S24+" },
  { brand: "Samsung", model: "Samsung Galaxy S24 FE" },
  { brand: "Samsung", model: "Samsung Galaxy S24" },
  { brand: "Samsung", model: "Samsung Galaxy S23 Ultra" },
  { brand: "Samsung", model: "Samsung Galaxy S23+" },
  { brand: "Samsung", model: "Samsung Galaxy S23 FE" },
  { brand: "Samsung", model: "Samsung Galaxy S23" },
  { brand: "Samsung", model: "Samsung Galaxy S22 Ultra" },
  { brand: "Samsung", model: "Samsung Galaxy S22+" },
  { brand: "Samsung", model: "Samsung Galaxy S22" },
  { brand: "Samsung", model: "Samsung Galaxy S21 Ultra" },
  { brand: "Samsung", model: "Samsung Galaxy S21+" },
  { brand: "Samsung", model: "Samsung Galaxy S21" },
  // Samsung Galaxy A & Tab
  { brand: "Samsung", model: "Samsung Galaxy A55" },
  { brand: "Samsung", model: "Samsung Galaxy A54" },
  { brand: "Samsung", model: "Samsung Galaxy A35" },
  { brand: "Samsung", model: "Samsung Galaxy A34" },
  { brand: "Samsung", model: "Samsung Galaxy A25" },
  { brand: "Samsung", model: "Samsung Galaxy A15" },
  { brand: "Samsung", model: "Samsung Galaxy A14" },
  { brand: "Samsung", model: "Samsung Galaxy Tab S9" },
  { brand: "Samsung", model: "Samsung Galaxy Tab S8" },
  // Google Pixel
  { brand: "Google", model: "Google Pixel 9 Pro XL" },
  { brand: "Google", model: "Google Pixel 9 Pro" },
  { brand: "Google", model: "Google Pixel 9" },
  { brand: "Google", model: "Google Pixel 8 Pro" },
  { brand: "Google", model: "Google Pixel 8a" },
  { brand: "Google", model: "Google Pixel 8" },
  { brand: "Google", model: "Google Pixel 7 Pro" },
  { brand: "Google", model: "Google Pixel 7a" },
  { brand: "Google", model: "Google Pixel 7" },
  // Xiaomi & Huawei & OnePlus
  { brand: "Xiaomi", model: "Xiaomi 14 Ultra" },
  { brand: "Xiaomi", model: "Xiaomi 14 Pro" },
  { brand: "Xiaomi", model: "Xiaomi 14" },
  { brand: "Xiaomi", model: "Xiaomi Redmi Note 13 Pro" },
  { brand: "Xiaomi", model: "Xiaomi Redmi Note 13" },
  { brand: "OnePlus", model: "OnePlus 12" },
  { brand: "OnePlus", model: "OnePlus 11" },
  { brand: "OnePlus", model: "OnePlus Nord 4" },
  { brand: "Huawei", model: "Huawei P60 Pro" },
  { brand: "Huawei", model: "Huawei Mate 60 Pro" },
  // Gaming & Laptops
  { brand: "Gaming", model: "PlayStation 5" },
  { brand: "Gaming", model: "Xbox Series X" },
  { brand: "Gaming", model: "Nintendo Switch OLED" },
  { brand: "Laptop", model: "Dell XPS 15" },
  { brand: "Laptop", model: "HP Spectre x360" },
  { brand: "Laptop", model: "Lenovo ThinkPad X1" },
];

const POPULAR_DEVICE_QUICK_PICKS = [
  "iPhone 15 Pro",
  "iPhone 14",
  "iPhone 13",
  "Samsung Galaxy S24",
  "Samsung Galaxy A54",
  "Google Pixel 8",
];

// ── Repair types list ────────────────────────────────────────────────────────
const REPAIR_TYPES: string[] = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Back Glass Replacement",
  "Camera Repair (Rear)",
  "Camera Repair (Front)",
  "Speaker Repair",
  "Earpiece Repair",
  "Microphone Repair",
  "Water Damage Repair",
  "Power Button Repair",
  "Volume Button Repair",
  "Home Button Repair",
  "SIM Card Reader Repair",
  "Headphone Jack Repair",
  "Face ID Repair",
  "Motherboard Repair",
  "Cracked Frame / Housing Repair",
  "Software / iOS Reset & Restore",
  "Software / Android Reset & Restore",
  "Network Unlock / SIM Unlock",
  "Data Recovery",
  "Diagnostic Check",
  "Laptop Screen Replacement",
  "Laptop Battery Replacement",
  "Console HDMI Port Repair",
  "Other Repair",
];

const POPULAR_REPAIRS_QUICK_PICKS = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Back Glass Replacement",
];

// ── Default warranty terms text ──────────────────────────────────────────────
const DEFAULT_WARRANTY_TERMS =
  "Covers the parts fitted and workmanship for this repair during the warranty period. Physical damage, liquid damage and faults unrelated to this repair are not covered.";

// ── Types ────────────────────────────────────────────────────────────────────
interface RepairItem {
  description: string;
  price: string;
  warranty_days: string;
  warranty_policy: string;
}

interface CreateRepairInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repair: any) => void;
}

const BLANK_ITEM: RepairItem = {
  description: "",
  price: "",
  warranty_days: "",
  warranty_policy: DEFAULT_WARRANTY_TERMS,
};

// ── Shared styles ────────────────────────────────────────────────────────────
const inp =
  "w-full px-3 h-[36px] border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] bg-white " +
  "focus:outline-none focus:border-[#AC313F] focus:ring-1 focus:ring-[#AC313F]/20 placeholder:text-[#888888] " +
  "transition-colors";
const lbl = "block text-[10.5px] font-bold text-[#666666] uppercase tracking-wider mb-1";
const sectionTitle = "text-[11px] font-extrabold text-[#171717] uppercase tracking-wider mb-2.5";

// ── SearchableDevicePicker ────────────────────────────────────────────────────
interface SearchableDevicePickerProps {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}

function SearchableDevicePicker({ value, onChange, hasError }: SearchableDevicePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (query.trim() && query.trim() !== value) {
          onChange(query.trim());
        }
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [query, value, onChange]);

  // Highlight index for arrow key navigation
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Tokenized filter: matches all typed words or returns top devices if query is empty
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEVICE_MODELS.slice(0, 30);
    const tokens = q.split(/\s+/).filter(Boolean);
    return DEVICE_MODELS.filter((item) => {
      const full = `${item.brand} ${item.model}`.toLowerCase();
      return tokens.every((tok) => full.includes(tok));
    }).slice(0, 25);
  }, [query]);

  const isExactMatch = DEVICE_MODELS.some(
    (d) => d.model.toLowerCase() === query.trim().toLowerCase(),
  );

  const handleSelectDevice = (deviceModelName: string) => {
    setQuery(deviceModelName);
    onChange(deviceModelName);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setHighlightedIndex(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setHighlightedIndex(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setOpen(true);
                return;
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const maxIdx = filtered.length;
              setHighlightedIndex((prev) => Math.min(prev + 1, maxIdx));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open) {
                if (highlightedIndex < filtered.length) {
                  handleSelectDevice(filtered[highlightedIndex].model);
                } else if (query.trim()) {
                  handleSelectDevice(query.trim());
                } else {
                  setOpen(false);
                }
              }
            } else if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
            }
          }}
          placeholder="Search device e.g. iPhone 15 Pro, S24…"
          className={`${inp} pl-8 pr-14 text-xs font-semibold ${
            hasError
              ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/20"
              : "hover:border-neutral-300"
          }`}
        />

        {/* Clear (×) and Chevron Toggle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                inputRef.current?.focus();
                setOpen(true);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded cursor-pointer transition-colors"
              title="Clear model"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (open) {
                setOpen(false);
              } else {
                setOpen(true);
                inputRef.current?.focus();
              }
            }}
            className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180 text-neutral-700" : ""}`} />
          </button>
        </div>
      </div>

      {hasError && (
        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Please enter or select a device model.
        </p>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#E5E5E5] rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 duration-100 max-h-[290px] overflow-y-auto divide-y divide-neutral-100 no-scrollbar">
          {/* Filtered Devices List */}
          <div className="p-1 space-y-0.5">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => {
                const isSelected = item.model.toLowerCase() === value.trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={`${item.brand}-${item.model}`}
                    type="button"
                    onClick={() => handleSelectDevice(item.model)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#AC313F]/10 text-[#AC313F] font-bold"
                        : isHighlighted
                        ? "bg-[#F7F7F7] text-[#171717] font-semibold"
                        : "hover:bg-[#F7F7F7] text-[#171717]"
                    }`}
                  >
                    <span className="font-semibold">{item.model}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {item.brand}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#AC313F] shrink-0" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-neutral-400 text-center">
                No matching catalog device found.
              </div>
            )}
          </div>

          {/* Option for Unlisted / Custom device */}
          <div className="p-1 bg-[#F7F7F7] border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => {
                if (query.trim()) {
                  handleSelectDevice(query.trim());
                } else {
                  setOpen(false);
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs text-[#AC313F] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                highlightedIndex === filtered.length ? "bg-[#AC313F]/10 text-[#AC313F]" : "hover:bg-[#AC313F]/5"
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>
                {query.trim() && !isExactMatch
                  ? `Use custom device: "${query.trim()}"`
                  : "+ Device not listed (Type custom)"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SearchableRepairTypePicker ───────────────────────────────────────────────
interface SearchableRepairTypePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function SearchableRepairTypePicker({
  value,
  onChange,
  placeholder = "e.g. Screen Replacement",
}: SearchableRepairTypePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (query.trim() && query.trim() !== value) {
          onChange(query.trim());
        }
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [query, value, onChange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return REPAIR_TYPES.filter((r) => r.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Wrench className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) {
                setQuery(filtered[0]);
                onChange(filtered[0]);
                setOpen(false);
              } else if (query.trim()) {
                setOpen(false);
              }
            }
          }}
          placeholder={placeholder}
          className={`${inp} pl-8 pr-7 text-xs font-semibold`}
        />
        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E5E5E5] rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {!query.trim() && (
            <div className="p-2 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Common Counter Work
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_REPAIRS_QUICK_PICKS.map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(quick);
                      onChange(quick);
                      setOpen(false);
                    }}
                    className="px-2 py-0.5 bg-neutral-100 hover:bg-[#AC313F] hover:text-white text-neutral-700 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && (
            <div className="py-1">
              {filtered.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(item);
                    onChange(item);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-800 font-medium hover:bg-[#AC313F]/10 hover:text-[#AC313F] transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
              {!REPAIR_TYPES.some((t) => t.toLowerCase() === query.trim().toLowerCase()) && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(query.trim());
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[11.5px] text-[#AC313F] font-bold hover:bg-[#AC313F]/10 border-t border-[#E5E5E5] cursor-pointer"
                >
                  Use &ldquo;{query.trim()}&rdquo; as custom repair
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RepairItemCard ────────────────────────────────────────────────────────────
interface RepairItemCardProps {
  item: RepairItem;
  idx: number;
  isOnly: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<RepairItem>) => void;
  onRemove: () => void;
}

function RepairItemCard({
  item,
  idx,
  isOnly,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: RepairItemCardProps) {
  const [showTerms, setShowTerms] = useState(false);
  const hasWarranty = Boolean(
    item.warranty_days.trim() &&
      item.warranty_days.trim() !== "0" &&
      parseInt(item.warranty_days, 10) > 0,
  );

  // When collapsed (multiple repairs): show high-density summary row
  if (!isExpanded && !isOnly) {
    return (
      <div className="flex items-center justify-between p-2.5 bg-white border border-[#E5E5E5] rounded-xl hover:border-neutral-300 transition-all shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#171717] block truncate">
              {item.description || `Repair ${idx + 1}`}
            </span>
            <span className="text-[10.5px] text-neutral-500 font-medium">
              {hasWarranty ? `${item.warranty_days} days warranty` : "No warranty"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-mono font-bold text-xs text-[#171717] tabular-nums">
            £{(parseFloat(item.price) || 0).toFixed(2)}
          </span>
          <button
            type="button"
            onClick={onToggleExpand}
            className="px-2 py-1 text-[11px] font-bold text-[#AC313F] hover:bg-[#AC313F]/10 rounded-md transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
            title="Remove repair"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Active / Expanded Item Card
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-xs space-y-2.5">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
            Repair {idx + 1}
          </span>
          {!isOnly && (
            <span className="text-[10px] font-bold text-[#AC313F] bg-[#AC313F]/10 px-1.5 py-0.2 rounded">
              Active Edit
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isOnly && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-[11px] font-bold text-neutral-500 hover:text-[#171717] transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
          {!isOnly && (
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Repair / Work selector */}
      <div>
        <label className={lbl}>
          Repair / Work <span className="text-[#AC313F]">*</span>
        </label>
        <SearchableRepairTypePicker
          value={item.description}
          onChange={(val) => onUpdate({ description: val })}
        />
      </div>

      {/* Price + Warranty — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>
            Price <span className="text-[#AC313F]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold pointer-events-none">
              £
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={item.price}
              onChange={(e) => onUpdate({ price: e.target.value })}
              placeholder="0.00"
              className={`${inp} pl-6 pr-2 text-right font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>Warranty Period</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={item.warranty_days}
              onChange={(e) => onUpdate({ warranty_days: e.target.value })}
              placeholder="0"
              className="w-16 h-[36px] px-1.5 border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717] bg-white focus:outline-none focus:border-[#AC313F] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">
              {hasWarranty ? "days" : "No warranty"}
            </span>
          </div>
        </div>
      </div>

      {/* Conditional Warranty Terms (Collapsed by default) */}
      {hasWarranty ? (
        <div className="pt-1.5 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setShowTerms((v) => !v)}
            className="text-[11px] font-bold text-neutral-600 hover:text-[#AC313F] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            {showTerms ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {showTerms ? "Hide warranty terms" : "▸ Edit warranty terms"}
          </button>
          {showTerms && (
            <textarea
              value={item.warranty_policy}
              onChange={(e) => onUpdate({ warranty_policy: e.target.value })}
              placeholder="Describe warranty coverage for this repair…"
              rows={2}
              className="mt-1.5 w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-[11px] text-[#171717] bg-[#F7F7F7] focus:bg-white focus:outline-none focus:border-[#AC313F] resize-none"
            />
          )}
        </div>
      ) : (
        <div className="text-[10.5px] text-neutral-400 italic">
          No warranty applied (warranty days blank). Terms omitted from receipt.
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function CreateRepairInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRepairInvoiceModalProps) {
  const createFn = useServerFn(createQuickRepairInvoice);

  // Form states
  const [deviceModel, setDeviceModel] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerImei, setCustomerImei] = useState("");
  const [items, setItems] = useState<RepairItem[]>([{ ...BLANK_ITEM }]);
  const [activeEditIndex, setActiveEditIndex] = useState<number>(0);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "part_paid">("paid");
  const [depositPounds, setDepositPounds] = useState<string>("");

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitAndPrint, setSubmitAndPrint] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  if (!isOpen) return null;

  const totalPounds = items.reduce((acc, i) => acc + (parseFloat(i.price) || 0), 0);
  const depositNum = parseFloat(depositPounds) || 0;
  const remainingPounds = Math.max(0, totalPounds - depositNum);

  function addItem() {
    setItems((prev) => {
      const next = [...prev, { ...BLANK_ITEM }];
      setActiveEditIndex(next.length - 1);
      return next;
    });
  }

  function removeItem(idx: number) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (activeEditIndex >= next.length) {
        setActiveEditIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  }

  function updateItem(idx: number, patch: Partial<RepairItem>) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  function resetForm() {
    setDeviceModel("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerImei("");
    setItems([{ ...BLANK_ITEM }]);
    setActiveEditIndex(0);
    setPaymentMethod("cash");
    setPaymentStatus("paid");
    setDepositPounds("");
    setNotes("");
    setSubmitAndPrint(false);
    setHasAttemptedSubmit(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent, printAfter = false) {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!deviceModel.trim()) {
      toast.error("Device / Model is required");
      return;
    }

    const validItems = items.filter((i) => i.description.trim() && parseFloat(i.price) > 0);
    if (validItems.length === 0) {
      toast.error("At least one repair item with a valid price is required");
      return;
    }

    setSubmitting(true);
    setSubmitAndPrint(printAfter);

    const notesParts: string[] = [];
    if (notes.trim()) {
      notesParts.push(notes.trim());
    }
    if (customerImei.trim()) {
      notesParts.push(`IMEI: ${customerImei.trim()}`);
    }
    if (paymentStatus === "part_paid") {
      notesParts.push(
        `Deposit Paid: £${depositNum.toFixed(2)} (${paymentMethod}) | Remaining: £${remainingPounds.toFixed(2)}`,
      );
    } else if (paymentStatus === "unpaid") {
      notesParts.push(`Payment Status: Unpaid (To be collected)`);
    }
    const combinedNotes = notesParts.length > 0 ? notesParts.join(" | ") : null;

    try {
      const repair = await createFn({
        data: {
          device_model: deviceModel.trim(),
          items: validItems.map((i) => {
            const daysInt = parseInt(i.warranty_days, 10);
            return {
              description: i.description.trim(),
              price_pence: Math.round(parseFloat(i.price) * 100),
              warranty_days:
                i.warranty_days.trim() === "" || isNaN(daysInt) || daysInt <= 0 ? null : daysInt,
              warranty_policy_text:
                daysInt > 0 && i.warranty_policy.trim() ? i.warranty_policy.trim() : null,
            };
          }),
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
          payment_method: paymentMethod,
          is_paid: paymentStatus === "paid",
          notes: combinedNotes,
        },
      });

      toast.success(`Repair invoice #${repair.rep_number} created!`);
      resetForm();
      onSuccess(repair);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create repair invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-[0.99] duration-150">
        {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3 bg-white border-b border-[#E5E5E5]">
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#171717] leading-tight">Create Repair Invoice</h1>
            <p className="text-[11px] text-neutral-500">
              Counter Intake &amp; Fast Ticket Generation · Phone Shop Birkenhead
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── TWO-COLUMN BODY (BALANCED COUNTER WORKSPACE) ────────────────── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5]">
          {/* ── LEFT COLUMN: CUSTOMER, DEVICE & NOTES (5 COLS) ──────────── */}
          <div className="lg:col-span-5 bg-[#F7F7F7] overflow-y-auto p-4 sm:p-5 space-y-4">
            <div>
              <p className={sectionTitle}>1. Customer Details</p>
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#E5E5E5]">
                <div>
                  <label className={lbl}>Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 07123 456789"
                    className={inp}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>2. Device Information</p>
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#E5E5E5]">
                <div>
                  <label className={lbl}>
                    Device / Model <span className="text-[#AC313F]">*</span>
                  </label>
                  <SearchableDevicePicker
                    value={deviceModel}
                    onChange={setDeviceModel}
                    hasError={hasAttemptedSubmit && !deviceModel.trim()}
                  />
                </div>

                <div>
                  <label className={lbl}>
                    IMEI / Serial <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerImei}
                    onChange={(e) => setCustomerImei(e.target.value)}
                    placeholder="15-digit IMEI or serial number"
                    className={`${inp} font-mono tracking-wider`}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>3. Diagnostic &amp; Counter Notes</p>
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E5E5]">
                <div className="flex items-center justify-between mb-1">
                  <label className={lbl}>Internal Notes</label>
                  <span className="text-[10px] text-neutral-400 italic">Not printed on customer receipt</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Passcode, screen cracked on arrival, slight dent on top left corner…"
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-xs text-[#171717] bg-white focus:outline-none focus:border-[#AC313F] resize-none placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: REPAIRS & COMMERCIAL (7 COLS) ─────────────── */}
          <div className="lg:col-span-7 bg-white overflow-y-auto p-4 sm:p-5 flex flex-col space-y-4">
            {/* Repair Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={sectionTitle}>4. Repair Work &amp; Pricing</p>
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                  {items.length} {items.length === 1 ? "service item" : "service items"}
                </span>
              </div>

              {/* Cards / Summary Accordion */}
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <RepairItemCard
                    key={idx}
                    item={item}
                    idx={idx}
                    isOnly={items.length === 1}
                    isExpanded={items.length === 1 || activeEditIndex === idx}
                    onToggleExpand={() => setActiveEditIndex(activeEditIndex === idx ? -1 : idx)}
                    onUpdate={(patch) => updateItem(idx, patch)}
                    onRemove={() => removeItem(idx)}
                  />
                ))}
              </div>

              {/* Compact Add Another Repair button */}
              <button
                type="button"
                onClick={addItem}
                className="mt-2.5 w-full h-[36px] bg-[#F7F7F7] border border-[#E5E5E5] hover:border-neutral-300 hover:bg-neutral-100 text-[#171717] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#AC313F]" />
                Add Another Repair Item
              </button>
            </div>

            {/* Commercial & Tender Section */}
            <div className="border-t border-[#E5E5E5] pt-4 space-y-3.5">
              <p className={sectionTitle}>5. Payment &amp; Commercial Terms</p>

              {/* Items Breakdown list */}
              <div className="space-y-1.5 bg-[#F7F7F7] p-3 rounded-xl border border-[#E5E5E5]">
                {items.map((item, idx) => {
                  const price = parseFloat(item.price) || 0;
                  return (
                    <div key={idx} className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-[#171717] truncate font-medium">
                        {item.description.trim() || `Repair ${idx + 1}`}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#171717] tabular-nums shrink-0">
                        {price > 0 ? `£${price.toFixed(2)}` : "£0.00"}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-[#E5E5E5] pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#171717] uppercase tracking-wide">Total Due</span>
                  <span className="text-lg font-black text-[#AC313F] font-mono tabular-nums">
                    £{totalPounds.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method */}
                <div>
                  <label className={lbl}>Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "cash", label: "Cash", Icon: Banknote },
                        { id: "card", label: "Card", Icon: CreditCard },
                        { id: "bank_transfer", label: "Bank", Icon: Building2 },
                      ] as const
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`h-[36px] flex items-center justify-center gap-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          paymentMethod === id
                            ? "bg-[#AC313F] text-white border-[#AC313F] shadow-xs"
                            : "bg-white border-[#E5E5E5] text-[#171717] hover:border-neutral-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Payment Status</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("paid")}
                      className={`py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                        paymentStatus === "paid"
                          ? "bg-emerald-600 text-white font-extrabold shadow-2xs"
                          : "text-neutral-600 hover:text-[#171717]"
                      }`}
                    >
                      Paid in Full
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("unpaid")}
                      className={`py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                        paymentStatus === "unpaid"
                          ? "bg-[#171717] text-white font-extrabold shadow-2xs"
                          : "text-neutral-600 hover:text-[#171717]"
                      }`}
                    >
                      Unpaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("part_paid")}
                      className={`py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                        paymentStatus === "part_paid"
                          ? "bg-amber-600 text-white font-extrabold shadow-2xs"
                          : "text-neutral-600 hover:text-[#171717]"
                      }`}
                    >
                      Part-paid
                    </button>
                  </div>
                </div>
              </div>

              {/* Part-paid deposit details */}
              {paymentStatus === "part_paid" && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs">Deposit collected now:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                        £
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        autoFocus
                        value={depositPounds}
                        onChange={(e) => setDepositPounds(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 h-8 bg-white border border-amber-300 rounded-lg text-right font-mono font-bold text-[#171717] outline-none focus:border-amber-600 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-amber-200">
                    <span className="text-amber-800 font-medium">Balance due on collection:</span>
                    <span className="font-mono font-black text-amber-950 text-sm">
                      £{remainingPounds.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ANCHORED ACTION FOOTER (ACROSS ENTIRE MODAL WIDTH) ─────────── */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 bg-white border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              Total Amount:{" "}
              <strong className="text-sm font-mono text-[#171717] tabular-nums">
                £{totalPounds.toFixed(2)}
              </strong>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs text-neutral-500">
              Tender: <strong className="capitalize text-[#171717]">{paymentMethod}</strong> (
              {paymentStatus === "paid" ? "Paid" : paymentStatus === "part_paid" ? `Deposit £${depositNum.toFixed(2)}` : "Unpaid"}
              )
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 h-10 border border-[#E5E5E5] hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Save Only */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 h-10 bg-white border border-[#E5E5E5] hover:bg-neutral-50 hover:border-neutral-300 text-[#171717] font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting && !submitAndPrint && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting && !submitAndPrint ? "Saving…" : "Save Only"}
            </button>

            {/* Save & Print Invoice (Primary) */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={submitting}
              className="flex-1 sm:flex-none px-5 h-10 bg-[#AC313F] hover:bg-[#782939] disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting && submitAndPrint ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              {submitting && submitAndPrint ? "Saving & Printing…" : "Save & Print Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
