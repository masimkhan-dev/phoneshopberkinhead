import { usePrintIdentity } from "@/components/dashboard/usePrintIdentity";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { Printer, X, ShieldCheck, CheckCircle2, Smartphone, FileText, ExternalLink } from "lucide-react";

interface DeviceSnapshot {
  brand: string;
  model: string;
  storage?: string | null;
  colour?: string | null;
  imei1: string;
  imei2?: string | null;
  serial_number?: string | null;
  condition_grade: string;
  condition_notes?: string | null;
  battery_health?: string | null;
  network_status?: string | null;
  face_id_status?: string | null;
  activation_lock_status?: string | null;
  accessories?: string | null;
  stock_number?: string | null;
}

export interface PhoneSaleInvoiceData {
  invoice_number: string;
  sold_at: string;
  buyer?: { name: string; phone?: string | null; address?: string | null; email?: string | null } | null;
  device_snapshot: DeviceSnapshot;
  selling_price_pence: number;
  payment_method: string;
  warranty_days?: number | null;
  warranty_policy_text?: string | null;
  warranty_start_date?: string | null;
  warranty_until?: string | null;
  notes?: string | null;
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) + " · " + new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGBP(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDeviceName(brand: string, model: string, storage?: string | null, colour?: string | null) {
  const parts = [];
  const brandTrim = (brand || "").trim();
  const modelTrim = (model || "").trim();
  
  if (modelTrim.toLowerCase().startsWith(brandTrim.toLowerCase())) {
    parts.push(modelTrim);
  } else {
    parts.push(`${brandTrim} ${modelTrim}`.trim());
  }

  if (storage && storage.trim()) {
    const s = storage.trim();
    parts.push(s.endsWith("GB") || s.endsWith("TB") ? s : `${s}GB`);
  }
  if (colour && colour.trim()) {
    parts.push(colour.trim());
  }
  return parts.join(" · ");
}

function formatConditionLabel(conditionGrade: string) {
  const grade = (conditionGrade || "Good").trim();
  if (grade.toLowerCase() === "new") return "Brand New";
  return `Used – ${grade}`;
}

function formatBatteryHealth(val?: string | null) {
  if (!val || val.trim() === "") return null;
  const cleaned = val.trim();
  return cleaned.endsWith("%") ? cleaned : `${cleaned}%`;
}

function formatFaults(notes?: string | null) {
  if (!notes || notes.trim() === "" || notes.trim().toLowerCase() === "none" || notes.trim().toLowerCase() === "fresh") {
    return null;
  }
  return notes.trim();
}

export function PhoneSaleInvoiceModal({
  data: d,
  onClose,
}: {
  data: PhoneSaleInvoiceData;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { identity } = usePrintIdentity();
  const businessName = d.business_name ?? identity.name;
  const businessAddress = d.business_address ?? identity.address;
  const businessPhone = d.business_phone ?? identity.phone;
  const businessEmail = d.business_email ?? identity.email;
  const dev = d.device_snapshot;

  const handlePrint = () => {
    window.print();
  };

  const deviceFullName = formatDeviceName(dev.brand, dev.model, dev.storage, dev.colour);
  const conditionLabel = formatConditionLabel(dev.condition_grade);
  const batteryHealth = formatBatteryHealth(dev.battery_health);
  const disclosedFaults = formatFaults(dev.condition_notes);
  const activationLock = dev.activation_lock_status && dev.activation_lock_status !== "Clean"
    ? dev.activation_lock_status
    : null;

  const formattedPaymentMethod =
    d.payment_method === "card"
      ? "Card"
      : d.payment_method === "cash"
        ? "Cash"
        : d.payment_method === "bank_transfer"
          ? "Bank Transfer"
          : d.payment_method
            ? d.payment_method.charAt(0).toUpperCase() + d.payment_method.slice(1)
            : "Card";

  const hasStoreWarranty = d.warranty_days !== null && d.warranty_days !== undefined && d.warranty_days > 0;

  if (!mounted) return null;

  const modalContent = (
    <div id="phone-sale-print-portal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm print-modal-overlay">
      <div className="bg-white border border-slate-300 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print-modal-card">
        
        {/* Modal Action Bar (Hidden completely in print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand" />
            <h2 className="font-extrabold text-sm text-white">
              Handset Sales Invoice — {d.invoice_number}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[36px] inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand/90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print A4 Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable A4 Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0 print:overflow-visible printable-a4-area">
          {/* HIGH-LEGIBILITY PROFESSIONAL A4 SHEET — GUARANTEED 1-PAGE */}
          <div className="bg-white border-0 shadow-none p-6 sm:p-8 print:p-0 max-w-3xl mx-auto space-y-3 print:space-y-2.5 text-slate-900 font-sans a4-sheet-page">
            
            {/* 1. STORE HEADER & LOGO */}
            <div className="flex justify-between items-center pb-2.5 print:pb-2 border-b-2 border-slate-900 gap-4">
              <div className="shrink-0">
                {BUSINESS.assets.logo && <img src={BUSINESS.assets.logo} alt="" className="h-16 w-auto object-contain" />}
              </div>

              <div className="text-right space-y-0.5">
                <h1 className="font-black text-lg sm:text-xl print:text-lg tracking-tight text-slate-900 leading-tight">
                  {businessName.toUpperCase()}
                </h1>
                <p className="text-xs print:text-xs text-slate-700 font-medium leading-tight">
                  {businessAddress}
                </p>
                <p className="text-xs print:text-xs text-slate-600 font-mono leading-tight">
                  Tel: {businessPhone}{businessEmail && ` · ${businessEmail}`}
                </p>
              </div>
            </div>

            {/* 2. INVOICE IDENTITY & METADATA BAR */}
            <div className="flex items-center justify-between gap-2 py-1.5 print:py-1 font-mono text-xs border-b border-slate-300">
              <div>
                <span className="font-bold text-slate-600">INVOICE NO: </span>
                <span className="font-extrabold text-sm text-brand">{d.invoice_number}</span>
              </div>
              <div className="text-center font-black text-xs tracking-widest text-slate-900 uppercase">
                HANDSET SALES INVOICE
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-600">DATE: </span>
                <span className="font-extrabold text-slate-900">{formatDateTime(d.sold_at)}</span>
              </div>
            </div>

            {/* 3. CUSTOMER DETAILS */}
            <div className="bg-slate-50 rounded-xl p-3 print:p-2.5 text-xs border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    CUSTOMER DETAILS
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {d.buyer?.name || "Walk-in Customer"}
                  </p>
                  {d.buyer?.address && (
                    <p className="text-slate-600 text-xs mt-0.5">{d.buyer.address}</p>
                  )}
                </div>
                {d.buyer?.phone && (
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                      CONTACT
                    </span>
                    <p className="text-slate-800 font-mono text-xs font-bold">{d.buyer.phone}</p>
                    {d.buyer?.email && <p className="text-slate-600 text-xs">{d.buyer.email}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* 4. DEVICE DETAILS & FINANCIAL SUMMARY */}
            <div className="bg-slate-50/50 rounded-xl p-3 print:p-2.5 space-y-2 text-xs border border-slate-200">
              <span className="font-extrabold text-[10px] text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                DEVICE DETAILS:
              </span>
              <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden bg-white">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-xs">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 w-44">IMEI / Identifiers</th>
                    <th className="py-2 px-3 w-36">Condition</th>
                    <th className="py-2 px-3 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      <span className="font-extrabold text-sm block text-slate-900">
                        {deviceFullName}
                      </span>
                      {dev.network_status && (
                        <span className="block text-xs text-slate-600">
                          Network: {dev.network_status}
                        </span>
                      )}
                      {dev.accessories && (
                        <span className="block text-xs text-slate-600">
                          Accessories: {dev.accessories}
                        </span>
                      )}
                      {activationLock && (
                        <span className="block text-xs text-slate-600">
                          Activation: {activationLock}
                        </span>
                      )}
                      {dev.stock_number && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Stock Ref: #{dev.stock_number}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-slate-700">
                      <span className="font-extrabold text-xs block text-slate-900">IMEI: {dev.imei1}</span>
                      {dev.imei2 && <span className="block text-slate-600 text-xs">IMEI 2: {dev.imei2}</span>}
                      {dev.serial_number && <span className="block text-slate-600 text-xs">S/N: {dev.serial_number}</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-700 text-xs">
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {conditionLabel}
                      </span>
                      {dev.face_id_status && (dev.face_id_status === "working" || dev.face_id_status === "not_working" || dev.face_id_status === "Working" || dev.face_id_status === "Not Working") && (
                        <span className="block text-xs text-slate-600 font-medium">
                          Face ID: {dev.face_id_status.toLowerCase().includes("not") ? "Not Working" : "Working"}
                        </span>
                      )}
                      {batteryHealth && (
                        <span className="block text-xs text-slate-600 font-medium">Battery: {batteryHealth}</span>
                      )}
                      {disclosedFaults && (
                        <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">Note: {disclosedFaults}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-sm text-slate-900">
                      {formatGBP(d.selling_price_pence)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals, Payment Breakdown & Warranty Flag */}
              <div className="flex justify-between items-end pt-2 border-t border-slate-300">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> PAID IN FULL
                  </div>
                  <div className="text-xs text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                    <span>
                      <strong className="text-slate-900">Store Warranty: </strong>
                      {hasStoreWarranty ? (
                        <span className="font-bold text-slate-800">
                          {d.warranty_days} Days ({d.warranty_until ? `Valid until ${formatDate(d.warranty_until)}` : "from purchase"})
                        </span>
                      ) : (
                        <span className="font-medium text-slate-600">No Additional Store Warranty</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="w-52 space-y-0.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-900 font-black text-sm">
                    <span>TOTAL:</span>
                    <span>{formatGBP(d.selling_price_pence)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>PAYMENT METHOD:</span>
                    <span className="font-bold">{formattedPaymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>AMOUNT PAID:</span>
                    <span className="font-bold">{formatGBP(d.selling_price_pence)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs border-t border-slate-400 pt-1 text-slate-900">
                    <span>BALANCE DUE:</span>
                    <span className="text-emerald-700">£0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. A MESSAGE TO OUR CUSTOMER (HUMAN, READABLE & UK-COMPLIANT) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 print:p-2.5 text-xs leading-relaxed text-slate-800 space-y-1.5">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-700" /> A MESSAGE TO OUR CUSTOMER
                </span>
                <span className="text-[10px] font-semibold text-slate-500 font-sans normal-case">
                  Consumer Rights Act 2015 applies
                </span>
              </div>

              <div className="space-y-1 text-slate-700 text-xs leading-relaxed">
                <p>
                  <strong className="text-slate-900">Dear Customer,</strong> Thank you for purchasing your phone from <strong className="text-slate-900">{businessName}</strong>. We truly appreciate your business and hope you enjoy your device. Please keep this invoice as your official proof of purchase. The device has been sold in the condition, specification, IMEI, and network status recorded on this invoice.
                </p>

                {hasStoreWarranty ? (
                  <p>
                    <strong className="text-slate-900">Store Warranty ({d.warranty_days} Days):</strong> Applies for {d.warranty_days} days from date of purchase ({d.warranty_until ? `valid until ${formatDate(d.warranty_until)}` : "stated period"}) covering eligible internal hardware faults. Accidental damage, physical damage, cracked screens, liquid damage, misuse and unauthorised repairs are not covered.
                  </p>
                ) : (
                  <p>
                    <strong className="text-slate-900">Store Warranty:</strong> No additional store warranty has been provided with this purchase.
                  </p>
                )}

                <p>
                  If you experience any issue with your device, please visit or contact us with this invoice. <span className="font-semibold text-slate-900">Nothing in our store terms affects rights provided under the Consumer Rights Act 2015.</span>
                </p>
              </div>
            </div>

            {/* 6. CUSTOMER ACKNOWLEDGEMENT & SIGNATURE */}
            <div className="pt-2 print:pt-1.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-700 font-medium">
              <div>
                Customer Signature: <span className="font-mono">___________________________________</span>
              </div>
              <div>
                Date: <span className="font-mono">_________________</span>
              </div>
            </div>

            {/* 7. FOOTER WITH GOOGLE REVIEW QR & POLICY REFERENCE */}
            <div className="pt-2 print:pt-1.5 border-t border-slate-200 flex flex-row items-center justify-between gap-4">
              {/* Left Column: Website Policy & Thank you */}
              <div className="text-left text-xs text-slate-600 leading-tight space-y-0.5">
                <p className="font-black text-slate-900 text-xs sm:text-sm">
                  Thank you for choosing {businessName}!
                </p>
                <p>
                  Please keep this invoice as proof of purchase and for any warranty or support claim.
                </p>
                <p className="font-medium pt-0.5">
                  {SITE_URL ? "Terms & policies: " : "Ask in store for terms and policies."}
                  {SITE_URL && <a href={SITE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-extrabold text-brand hover:underline inline-flex items-center gap-0.5"
                  >
                    birkenheadmobiles.co.uk
                    <ExternalLink className="w-3 h-3 print:hidden text-brand" />
                  </a>}
                </p>
              </div>

              {/* Right Column: Google Review QR Block */}
              {BUSINESS.reviewUrl && BUSINESS.assets.reviewQr && (<div className="flex flex-row items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {BUSINESS.assets.reviewQr && BUSINESS.reviewUrl && <img src={BUSINESS.assets.reviewQr} alt="Google review QR" className="h-16 w-16" />}
                <div className="text-left space-y-0.5">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-900 block">
                    SHARE YOUR EXPERIENCE
                  </span>
                  <span className="text-[10px] text-slate-600 block leading-tight">
                    Scan to leave a review on Google
                  </span>
                </div>
              </div>)}
            </div>

          </div>
        </div>
      </div>

      {/* DUAL PRINT ENGINE CSS — STRICT SINGLE-PAGE A4 FIT VIA PORTAL ISOLATION */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          /* HIDE ENTIRE APP TREE IN BODY EXCEPT THIS INVOICE PORTAL */
          body > *:not(#phone-sale-print-portal) {
            display: none !important;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          #phone-sale-print-portal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .print-modal-overlay {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
          }

          .print-modal-card {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .printable-a4-area {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .a4-sheet-page {
            display: block !important;
            width: 100% !important;
            max-width: 190mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function PhoneSaleInvoice({ data }: { data: PhoneSaleInvoiceData }) {
  return null;
}
