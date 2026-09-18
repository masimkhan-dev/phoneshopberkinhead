import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wrench, ShieldCheck, Clock, ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react";
import { BUSINESS } from "@/lib/business";

const DEVICE_TYPES = [
  { id: "mobile", label: "Mobile Phone" },
  { id: "laptop", label: "Laptop / MacBook" },
  { id: "console", label: "Gaming Console" },
  { id: "tablet", label: "iPad / Tablet" },
];

const MODELS: Record<string, string[]> = {
  mobile: [
    "iPhone 15 / 14 / 13 Pro",
    "iPhone 12 / 11 / SE",
    "Samsung Galaxy S24 / S23",
    "Samsung A-Series / FE",
    "Google Pixel 8 / 7",
  ],
  laptop: [
    "MacBook Air / Pro (M1/M2/M3)",
    "MacBook Pro (Intel)",
    "Dell / HP / Lenovo Laptop",
    "Asus / Acer / Gaming Laptop",
  ],
  console: [
    "PlayStation 5 (Disc/Digital)",
    "PlayStation 4 / Pro",
    "Xbox Series X / Series S",
    "Nintendo Switch / OLED",
  ],
  tablet: ["iPad Air / Pro", "iPad 10th/9th Gen", "Samsung Galaxy Tab"],
};

const REPAIR_TYPES: Record<string, { label: string; est: string; time: string }[]> = {
  mobile: [
    { label: "Screen Replacement", est: "£45 - £120", time: "30-45 Mins" },
    { label: "Battery Replacement", est: "£35 - £55", time: "30 Mins" },
    { label: "Charging Port Fix", est: "£35 - £50", time: "45 Mins" },
    { label: "Camera / Glass Repair", est: "£40 - £75", time: "45 Mins" },
    { label: "Liquid Damage Diagnosis", est: "£25 Diagnostics", time: "Same Day" },
  ],
  laptop: [
    { label: "Screen Replacement", est: "£65 - £140", time: "1-2 Hours" },
    { label: "Battery Replacement", est: "£55 - £85", time: "45 Mins" },
    { label: "Keyboard / Trackpad", est: "£45 - £80", time: "Same Day" },
    { label: "SSD Upgrade & Speedup", est: "£50 - £95", time: "Same Day" },
    { label: "Power / Charging Jack", est: "£45 - £65", time: "Same Day" },
  ],
  console: [
    { label: "HDMI Port Repair", est: "£50 - £70", time: "Same Day" },
    { label: "Deep Clean & Thermal Paste", est: "£35 - £45", time: "1 Hour" },
    { label: "Power Supply / Overheating", est: "£45 - £75", time: "Same Day" },
    { label: "Disk Drive / Controller Fix", est: "£35 - £60", time: "Same Day" },
  ],
  tablet: [
    { label: "Glass & Digitiser", est: "£45 - £85", time: "1-2 Hours" },
    { label: "LCD & Touch Assembly", est: "£65 - £130", time: "Same Day" },
    { label: "Battery Replacement", est: "£45 - £65", time: "Same Day" },
  ],
};

export function InstantPriceChecker() {
  const [deviceType, setDeviceType] = useState<string>("mobile");
  const [selectedModel, setSelectedModel] = useState<string>(MODELS.mobile[0]);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number>(0);

  const availableModels = MODELS[deviceType] || MODELS.mobile;
  const availableIssues = REPAIR_TYPES[deviceType] || REPAIR_TYPES.mobile;
  const currentIssue = availableIssues[selectedIssueIndex] || availableIssues[0];

  const handleDeviceChange = (typeId: string) => {
    setDeviceType(typeId);
    setSelectedModel(MODELS[typeId][0]);
    setSelectedIssueIndex(0);
  };

  const whatsappMsg = `Hi Phone Shop Birkenhead, I would like a quote for ${selectedModel} - ${currentIssue.label}. Is this available today?`;

  return (
    <section className="section-pad bg-[#171717] text-white" id="price-checker">
      <div className="container-page grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-12 items-start">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#252525] px-3 py-1 text-xs font-bold text-[#AC313F]">
            <Wrench className="w-3.5 h-3.5" /> Instant Repair Estimator
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight !text-white font-display">
            Quick Estimates Before You Visit
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Select your device type, model, and repair fault below to view estimated prices and turnaround times.
            Walk-ins are always welcome at 16 Borough Pavement!
          </p>

          <div className="mt-8 space-y-3.5 text-sm text-white/90">
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#252525] text-[#AC313F] border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>No fix, no fee diagnostic policy</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#252525] text-[#AC313F] border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>Quality replacement screens, batteries &amp; ports</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#252525] text-[#AC313F] border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>Store repair warranty included on all completed jobs</span>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-[#252525] p-4 text-xs text-white/80">
            <strong className="text-white">Need a non-standard device fixed?</strong>
            <p className="mt-1 text-white/70">
              We also service iPads, MacBooks, gaming consoles, and perform board-level micro-soldering.
              Call <a href={BUSINESS.phoneHref} className="font-bold text-white hover:text-[#AC313F] underline">{BUSINESS.phone}</a> for a custom quote.
            </p>
          </div>
        </div>

        {/* Counter Estimator Terminal */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 sm:p-7 shadow-xl text-[#171717]">
          {/* Terminal Step Progress */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Step 1: Choose Device
            </div>
            <span className="rounded-md bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 text-[11px] font-bold text-[#171717]">
              Counter Tool
            </span>
          </div>

          {/* Device Category Selector */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DEVICE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleDeviceChange(t.id)}
                aria-pressed={deviceType === t.id}
                className={`min-h-12 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer text-center ${
                  deviceType === t.id
                    ? "bg-[#AC313F] text-white shadow-xs"
                    : "border border-[#E5E5E5] bg-[#F7F7F7] text-[#171717] hover:bg-white hover:border-[#AC313F]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Model and Issue Selectors */}
          <div className="mt-6 grid md:grid-cols-2 gap-5 items-start">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#171717]">
                2. Select Model
              </label>
              <div className="space-y-1.5">
                {availableModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    aria-pressed={selectedModel === m}
                    className={`min-h-11 w-full rounded-xl border px-3.5 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                      selectedModel === m
                        ? "border-[#AC313F] bg-[#F7F7F7] text-[#AC313F] font-bold shadow-xs"
                        : "border-[#E5E5E5] bg-white text-[#171717] hover:border-[#AC313F]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#171717]">
                3. Select Repair Fault
              </label>
              <div className="space-y-1.5">
                {availableIssues.map((issue, idx) => (
                  <button
                    key={issue.label}
                    type="button"
                    onClick={() => setSelectedIssueIndex(idx)}
                    aria-pressed={selectedIssueIndex === idx}
                    className={`min-h-11 w-full rounded-xl border px-3.5 py-2 text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      selectedIssueIndex === idx
                        ? "border-[#AC313F] bg-[#F7F7F7] text-[#AC313F] font-bold shadow-xs"
                        : "border-[#E5E5E5] bg-white text-[#171717] hover:border-[#AC313F]"
                    }`}
                  >
                    <span className="truncate">{issue.label}</span>
                    <span className="shrink-0 rounded-md bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-mono font-bold text-[#171717] tabular-nums">
                      {issue.est}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quote Result Box */}
          <div
            key={`${deviceType}-${selectedModel}-${selectedIssueIndex}`}
            className="mt-6 flex flex-col items-start justify-between gap-5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-5"
          >
            <div className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Estimated Price &amp; Turnaround
                </span>
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#AC313F] tabular-nums">
                  {currentIssue.est}
                </span>
              </div>

              <div className="mt-3 font-display text-lg sm:text-xl font-bold text-[#171717]">
                {selectedModel} — {currentIssue.label}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#666666]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#AC313F]" /> Turnaround:{" "}
                  <b className="text-[#171717]">{currentIssue.time}</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#AC313F]" /> Warranty Included
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Walk-in service
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-3 sm:flex-row">
              {BUSINESS.whatsapp && (
                <a
                  href={BUSINESS.whatsappMessage(whatsappMsg)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp min-h-11 w-full sm:w-auto justify-center !text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Quote
                </a>
              )}
              <Link to="/contact" className="btn-primary min-h-11 w-full sm:w-auto justify-center !text-xs font-bold">
                Book or Enquire <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="btn-outline min-h-11 w-full sm:w-auto justify-center !text-xs font-bold !bg-white"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
