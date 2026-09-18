import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle, ArrowDown, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Get a Quote | Phone Shop Birkenhead" },
      {
        name: "description",
        content:
          "Visit Phone Shop Birkenhead at 16 Borough Pavement or call +44 151 345 0404. Express device repair quotes, walk-in counter service and pre-owned devices.",
      },
      { property: "og:title", content: "Contact Phone Shop Birkenhead | Birkenhead, Wirral" },
      {
        property: "og:description",
        content: "Call, message or visit our high-street store in Birkenhead for device repairs and tech accessories.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/contact` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/contact` }] : [],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    device: "",
    brand: "",
    service: "Mobile Screen Repair",
    method: "Walk-In (16 Borough Pavement)",
    message: "",
  });
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = `New repair enquiry from ${form.name}\nPhone: ${form.phone}\nDevice: ${form.device}\nBrand/Model: ${form.brand}\nService: ${form.service}\nMethod: ${form.method}\n\nFault Description: ${form.message}`;
    if (BUSINESS.whatsapp) {
      window.open(BUSINESS.whatsappMessage(msg), "_blank");
    } else {
      window.location.href = `mailto:${BUSINESS.email || "info@phoneshopbirkenhead.co.uk"}?subject=Repair Enquiry&body=${encodeURIComponent(msg)}`;
    }
    setSent(true);
  }

  const scrollToForm = () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <SiteLayout>
      {/* ── 1. COMPACT HERO SECTION (Unified PageHero) ── */}
      <PageHero
        eyebrow="Birkenhead High Street • 16 Borough Pavement"
        title="Visit Our Birkenhead Counter or Request a Quote"
        description="Walk in with no appointment needed or send us your device details for a quick repair estimate. Located directly in Grange Precinct."
        actions={
          <>
            <button
              type="button"
              onClick={scrollToForm}
              className="btn-primary min-h-11 !px-5 !text-xs font-bold cursor-pointer"
            >
              Get a Repair Quote <ArrowDown className="h-4 w-4" />
            </button>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-11 !px-4 !text-xs font-bold !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F] hover:!text-[#AC313F]"
            >
              <Phone className="h-4 w-4 text-[#AC313F]" /> Call Us: {BUSINESS.phone}
            </a>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#555555]">
            <span className="flex items-center gap-1"><span className="text-[#10B981]">✓</span> Walk-ins welcome</span>
            <span>•</span>
            <span className="flex items-center gap-1"><span className="text-[#10B981]">✓</span> Fast local turnaround</span>
            <span>•</span>
            <span className="flex items-center gap-1"><span className="text-[#10B981]">✓</span> Free counter diagnosis</span>
          </div>
        }
      />

      {/* ── 2. MAIN CONTENT (38% Left Coherent Card / 62% Right Form, Tight Spacing) ── */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container-page grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: One Coherent "Visit Us" Location Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden shadow-xs">
              {/* Clean Workbench Visual (No development note/caption) */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F7F7]">
                <img
                  src={SITE_MEDIA.shopfront.src}
                  alt={SITE_MEDIA.shopfront.alt}
                  width={SITE_MEDIA.shopfront.width}
                  height={SITE_MEDIA.shopfront.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#171717]/90 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    Walk-In Counter
                  </span>
                </div>
              </div>

              {/* Unified Store Details */}
              <div className="p-6 space-y-5">
                <div>
                  <strong className="block text-lg font-extrabold text-[#171717]">
                    {BUSINESS.name}
                  </strong>
                  <span className="block text-xs font-semibold text-[#666666]">
                    Grange Precinct, Birkenhead
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 text-xs leading-relaxed text-[#666666]">
                  <MapPin className="h-4 w-4 text-[#AC313F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-[#171717] block text-sm">Store Address</strong>
                    <span>
                      {BUSINESS.addressLine},<br />
                      {BUSINESS.area}, {BUSINESS.city},<br />
                      {BUSINESS.postcode}
                    </span>
                  </div>
                </div>

                {/* Direct Phone */}
                <div className="flex items-center gap-3 text-xs text-[#666666] pt-1 border-t border-[#E5E5E5]">
                  <Phone className="h-4 w-4 text-[#AC313F] shrink-0" />
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-[#171717]">
                      Direct Telephone
                    </span>
                    <a
                      href={BUSINESS.phoneHref}
                      className="font-bold text-sm text-[#171717] hover:text-[#AC313F] transition-colors"
                    >
                      {BUSINESS.phone}
                    </a>
                  </div>
                </div>

                {/* Opening Hours (Cleanly rendered table with fallback) */}
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                    <Clock className="h-3.5 w-3.5 text-[#AC313F]" />
                    <span>Opening Hours</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5] font-medium text-[#666666]">
                      <span>Monday – Saturday</span>
                      <strong className="font-bold text-[#171717]">9:00 AM – 5:30 PM</strong>
                    </div>
                    <div className="flex justify-between py-1 font-medium text-[#666666]">
                      <span>Sunday</span>
                      <span className="font-semibold text-[#666666]">Closed</span>
                    </div>
                  </div>
                </div>

                {/* Location Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <a
                    href={BUSINESS.mapsDirections}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline !h-10 justify-center !text-xs font-bold"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#AC313F]" /> Directions
                  </a>
                  <a
                    href={BUSINESS.phoneHref}
                    className="btn-dark !h-10 justify-center !text-xs font-bold"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Counter
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Converting Repair Enquiry Form */}
          <div className="lg:col-span-7 order-1 lg:order-2" id="enquiry-form">
            {sent ? (
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-8 sm:p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#171717]">
                  Thank You — Enquiry Created!
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666666] max-w-md mx-auto">
                  We have prepared your device enquiry. If your WhatsApp or email client didn't open automatically, you can call us directly on <strong>{BUSINESS.phone}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-primary mt-6 !h-11 !text-sm"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
                    Quick Repair Enquiry
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#666666]">
                    Tell us about your device and we’ll get back to you with clear pricing and turnaround information.
                  </p>
                </div>

                {/* Row 1: Name & Phone */}
                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  <Field
                    label="Your Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="e.g. Sarah Jenkins"
                    required
                  />
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="e.g. 07123 456789"
                    required
                  />
                </div>

                {/* Row 2: Device Type & Brand / Model */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <Field
                    label="Device Type"
                    value={form.device}
                    onChange={(v) => setForm({ ...form, device: v })}
                    placeholder="e.g. Smartphone, Laptop, Console"
                  />
                  <Field
                    label="Brand / Model"
                    value={form.brand}
                    onChange={(v) => setForm({ ...form, brand: v })}
                    placeholder="e.g. iPhone 14, Galaxy S23, PS5"
                  />
                </div>

                {/* Row 3: Service Needed & Preferred Route */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <Select
                    label="Service Needed"
                    value={form.service}
                    onChange={(v) => setForm({ ...form, service: v })}
                    options={[
                      "Mobile Screen Repair",
                      "Mobile Battery Replacement",
                      "Charging Port Fix",
                      "Water Damage Diagnostics",
                      "Laptop / PC Repair",
                      "Gaming Console HDMI / Repair",
                      "Sell My Device (Instant Cash)",
                      "Accessories & Protection",
                    ]}
                  />
                  <Select
                    label="Preferred Repair Route"
                    value={form.method}
                    onChange={(v) => setForm({ ...form, method: v })}
                    options={[
                      "Walk-In (16 Borough Pavement)",
                      "Collection Enquiry",
                      "Mail-In Discussion",
                    ]}
                  />
                </div>

                {/* Row 4: Describe Issue */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                    Describe the Issue
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-2.5 text-sm text-[#171717] focus:border-[#AC313F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#AC313F]/20 min-h-[85px] leading-relaxed transition-all"
                    placeholder="e.g. Smashed glass screen, touch works. Need it back today if possible."
                  />
                </div>

                {/* Primary Button */}
                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full !h-12 !text-sm sm:!text-base !font-bold">
                    <Send className="w-4 h-4" /> Submit Enquiry
                  </button>
                  <p className="mt-2 text-xs text-center font-medium text-[#666666]">
                    No obligation. We’ll review your enquiry and provide a clear quote.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. MAP SECTION (Natural spacing, no excessive gap) ── */}
      {BUSINESS.mapsEmbed && (
        <section className="pb-12 bg-white">
          <div className="container-page">
            <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] shadow-xs">
              <iframe
                title="Map to Phone Shop Birkenhead"
                src={BUSINESS.mapsEmbed}
                className="w-full h-[320px] md:h-[380px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
        {label}
        {required && <span className="text-[#AC313F] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#171717] focus:border-[#AC313F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#AC313F]/20 transition-all"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-2 text-sm text-[#171717] focus:border-[#AC313F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#AC313F]/20 transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
