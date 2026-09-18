import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Gamepad2,
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Star,
  Tablet,
  Wrench,
  Zap,
  ShoppingBag,
  Sparkles,
  Award,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { InstantPriceChecker } from "@/components/site/InstantPriceChecker";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Phone Repairs Done Properly in Birkenhead | Phone Shop Birkenhead" },
      {
        name: "description",
        content:
          "Express phone, laptop, tablet and console repairs in Birkenhead. Walk-in service at 16 Borough Pavement, Grange Precinct. Fast turnaround and repair warranty.",
      },
      {
        property: "og:title",
        content: "Phone Repairs Done Properly in Birkenhead | Phone Shop Birkenhead",
      },
      {
        property: "og:description",
        content:
          "Professional device repairs, phone buy & sell, and technology retail at 16 Borough Pavement, Birkenhead.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/` }] : []),
      ...(BUSINESS.assets.ogImage
        ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage
        ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }]
        : []),
    ],
    links: [
      ...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/` }] : []),
      {
        rel: "preload",
        as: "image",
        href: SITE_MEDIA.repairHero.src,
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "ElectronicsStore"],
          ...(SITE_URL ? { "@id": `${SITE_URL}/#business` } : {}),
          name: BUSINESS.name,
          ...(BUSINESS.assets.logo ? { image: `${SITE_URL}${BUSINESS.assets.logo}` } : {}),
          telephone: BUSINESS.phone,
          ...(BUSINESS.email ? { email: BUSINESS.email } : {}),
          ...(SITE_URL ? { url: `${SITE_URL}/` } : {}),
          address: {
            "@type": "PostalAddress",
            streetAddress: BUSINESS.addressLine,
            addressLocality: BUSINESS.city,
            postalCode: BUSINESS.postcode,
            addressCountry: "GB",
          },
          ...(BUSINESS.geo.latitude !== null && BUSINESS.geo.longitude !== null
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: BUSINESS.geo.latitude,
                  longitude: BUSINESS.geo.longitude,
                },
              }
            : {}),
          ...(BUSINESS.openingHoursSchema.length
            ? { openingHoursSpecification: BUSINESS.openingHoursSchema }
            : {}),
          areaServed: "Birkenhead, Merseyside, Wirral, UK",
        }),
      },
    ],
  }),
  component: HomePage,
});

const ACCESSORIES = [
  {
    title: "Heavy-Duty Drop Cases",
    desc: "Shockproof protection for iPhone 11–16, Samsung Galaxy S/A series & Google Pixel.",
    tag: "In Stock",
  },
  {
    title: "Fast USB-C Wall Chargers",
    desc: "20W, 30W & 65W PD fast chargers for high-speed charging without overheating.",
    tag: "High Speed",
  },
  {
    title: "Reinforced Braided Cables",
    desc: "Durable Lightning, USB-C and Micro USB cables built with reinforced stress points.",
    tag: "Heavy Duty",
  },
  {
    title: "Tempered Glass Protectors",
    desc: "9H scratch & shatter protection — professionally fitted free of charge at our counter.",
    tag: "Free Fitting",
  },
  {
    title: "Wireless Audio & Earbuds",
    desc: "Bluetooth earbuds with noise isolation, long battery life and clear microphone audio.",
    tag: "Counter Stock",
  },
  {
    title: "Portable Power Banks",
    desc: "Compact high-capacity external power packs for emergency charging on the go.",
    tag: "Portable",
  },
];

const CUSTOMER_REVIEWS = [
  {
    quote:
      "Repaired my smashed iPhone 13 screen in under 30 minutes while I did some shopping in Grange Precinct. Fantastic price and polite, honest service.",
    author: "Dave M.",
    location: "Birkenhead",
    stars: 5,
    verified: "Verified Local Customer",
  },
  {
    quote:
      "My PS5 had a broken HDMI port. Brought it in morning, picked it up fully working that afternoon. Tested on display before I left. Highly recommend!",
    author: "Liam K.",
    location: "Wirral",
    stars: 5,
    verified: "Console Repair",
  },
  {
    quote:
      "Honest lads. Looked at my laptop that wouldn't charge, gave a clear diagnosis, and fitted a new battery the same day with store warranty.",
    author: "Sarah T.",
    location: "Birkenhead",
    stars: 5,
    verified: "Laptop Service",
  },
];

function HomePage() {
  const scrollToQuote = () =>
    document.getElementById("price-checker")?.scrollIntoView({ behavior: "smooth" });

  return (
    <SiteLayout>
      {/* ── SECTION 1: HERO SECTION (Asymmetrical Split + Storefront Dominance) ── */}
      <section className="relative overflow-hidden bg-[#F7F7F7] text-[#171717] border-b border-[#E5E5E5] py-10 lg:py-14">
        <div className="container-page grid items-center gap-8 lg:grid-cols-[1fr_1.08fr] lg:gap-12">
          {/* Left Column: High-intent local proposition */}
          <div className="z-10 max-w-2xl">
            {/* Location & Trust Cue */}
            <div className="inline-flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-bold text-[#171717] mb-5 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-[#AC313F]" />
              <span>16 Borough Pavement • Grange Precinct, Birkenhead</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.08] tracking-tight text-[#171717]">
              Phone Repairs Done{" "}
              <span className="text-[#AC313F]">Properly</span> in Birkenhead
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#555555]">
              Express smartphone, tablet, laptop and gaming console repairs in Birkenhead town centre.
              Screen &amp; battery replacements with quality display panels and store warranty included.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToQuote}
                className="btn-primary min-h-12 !px-6 !text-sm font-bold shadow-xs cursor-pointer"
              >
                Get a Repair Quote <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={BUSINESS.phoneHref}
                className="btn-outline min-h-12 !px-5 !text-sm font-bold !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F] hover:!text-[#AC313F]"
              >
                <Phone className="h-4 w-4 text-[#AC313F]" /> Call {BUSINESS.phone}
              </a>
              <a
                href={BUSINESS.mapsDirections}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-1.5 px-3 text-xs font-bold text-[#171717] hover:text-[#AC313F] transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-[#AC313F]" /> Get Directions
              </a>
            </div>

            {/* Compact Trust Proof Rail (Factual Retail Information) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-t border-[#E5E5E5] pt-5 text-xs font-semibold text-[#171717]">
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 shadow-2xs">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <div className="leading-tight">
                  <strong className="block text-[#171717] text-xs">Recommended</strong>
                  <span className="text-[10px] text-[#666666]">Local customer reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 shadow-2xs">
                <Clock className="h-3.5 w-3.5 text-[#AC313F] shrink-0" />
                <div className="leading-tight">
                  <strong className="block text-[#171717] text-xs">Fast Turnaround</strong>
                  <span className="text-[10px] text-[#666666]">Same-day on common fixes</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <div className="leading-tight">
                  <strong className="block text-[#171717] text-xs">Store Warranty</strong>
                  <span className="text-[10px] text-[#666666]">Tested parts &amp; labour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dominant Birkenhead Storefront Photography + Crisp Retail Badge */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-md aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/11]">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/site-assets/responsive/shopfront-hero-480.webp 480w, /site-assets/responsive/shopfront-hero-768.webp 768w, /site-assets/responsive/shopfront-hero-1200.webp 1200w"
                  sizes="(max-width: 1023px) 100vw, 52vw"
                />
                <img
                  src="/site-assets/birkenhead/hero img.png"
                  alt="Phone Shop Birkenhead walk-in store at 16 Borough Pavement, Grange Precinct"
                  width={591}
                  height={375}
                  fetchPriority="high"
                  decoding="sync"
                  className="h-full w-full object-cover object-[center_35%]"
                />
              </picture>
            </div>

            {/* Single Solid, Crisp Retail Badge (No Glassmorphism, No Fake Lighting) */}
            <div className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2.5 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 shadow-sm text-[#171717]">
              <div className="grid h-8 w-8 place-items-center rounded bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F] shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="pr-1 leading-tight">
                <strong className="block text-xs font-bold text-[#171717]">Walk-In Counter</strong>
                <span className="block text-[10px] text-[#666666]">16 Borough Pavement • No booking needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INSTANT PRICE CHECKER (Directly Above Fold Progression) ── */}
      <InstantPriceChecker />

      {/* ── SECTION 3: COMMON REPAIRS (Editorial Retail/Service Layout) ── */}
      <section className="section-pad bg-white" id="services">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Repair Workshop</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
                Common Tech Repairs Fixed in Birkenhead
              </h2>
              <p className="mt-2 text-sm md:text-base text-[#666666] max-w-2xl">
                From cracked displays and failing batteries to liquid damage diagnosis and logic board soldering.
              </p>
            </div>
            <Link
              to="/services"
              className="flex min-h-11 items-center gap-2 text-sm font-bold text-[#AC313F] hover:text-[#782939] shrink-0"
            >
              View all repair services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Editorial Service Layout: 1 Dominant Flagship Area + 4 Compact Stacked Service Rows */}
          <div className="mt-9 grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Flagship Service Area: Smartphone Screen & Battery (Col 1-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#AC313F]/30 bg-[#F7F7F7] p-6 sm:p-7 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded bg-[#AC313F] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                    Flagship Service
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-white border border-[#E5E5E5] px-2 py-0.5 text-xs font-bold text-[#171717]">
                    <Clock className="h-3 w-3 text-[#AC313F]" /> 30–45 Mins
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl sm:text-2xl font-extrabold text-[#171717]">
                  iPhone &amp; Samsung Screen &amp; Battery Replacements
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#555555]">
                  Our primary walk-in repair. We replace cracked glass, unresponsive touch digitizers, and degraded batteries while you wait in Birkenhead.
                </p>

                <div className="mt-5 space-y-2 border-t border-[#E5E5E5] pt-4 text-xs font-semibold text-[#171717]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                    <span>High-grade OLED and vivid LCD replacement panels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                    <span>Fresh high-capacity batteries restored to full health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                    <span>True Tone programming &amp; touch sensitivity preserved</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <Link
                  to="/mobile-phone-repair-birkenhead"
                  className="btn-primary !h-10 !px-4 !text-xs font-bold w-full justify-center sm:w-auto"
                >
                  Phone Repair Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="hidden sm:inline text-xs font-bold text-[#666666]">Walk-in friendly</span>
              </div>
            </div>

            {/* Compact Stacked Service Rows (Col 6-12) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5] overflow-hidden">
              {/* Row 1: iPad & Tablet */}
              <Link
                to="/services"
                className="group p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#F7F7F7]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-display text-base font-bold text-[#171717] group-hover:text-[#AC313F] transition-colors">
                      iPad &amp; Tablet Repairs
                    </h4>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      1–2 Hours
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed max-w-xl">
                    Glass digitizers, LCD assemblies, charging sockets, and battery replacements for iPad Pro, Air, Mini, and Samsung Galaxy Tab.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#AC313F] shrink-0">
                  <span className="hidden sm:inline">Options</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Row 2: Laptop & Mac */}
              <Link
                to="/laptop-computer-repair-birkenhead"
                className="group p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#F7F7F7]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-display text-base font-bold text-[#171717] group-hover:text-[#AC313F] transition-colors">
                      Laptop &amp; MacBook Servicing
                    </h4>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      Same Day
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed max-w-xl">
                    Hardware diagnostics, cracked screen panels, failing SSD drives, replacement keyboards, and fan cleaning for Mac and Windows.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#AC313F] shrink-0">
                  <span className="hidden sm:inline">Repairs</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Row 3: Gaming Consoles */}
              <Link
                to="/gaming-console-repair-birkenhead"
                className="group p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#F7F7F7]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-display text-base font-bold text-[#171717] group-hover:text-[#AC313F] transition-colors">
                      Gaming Console Fixes
                    </h4>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      Same Day
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed max-w-xl">
                    PlayStation 5 and Xbox Series X damaged HDMI ports, internal fan deep-cleaning, disc drive mechanisms, and Switch controller repairs.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#AC313F] shrink-0">
                  <span className="hidden sm:inline">Details</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Row 4: Ports & Micro-Soldering */}
              <Link
                to="/services"
                className="group p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#F7F7F7]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-display text-base font-bold text-[#171717] group-hover:text-[#AC313F] transition-colors">
                      Charging Ports &amp; Micro-Soldering
                    </h4>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded">
                      45 Mins
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed max-w-xl">
                    Loose Type-C and Lightning connectors, debris extraction, bent pins, power faults, and board-level solder repairs.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#AC313F] shrink-0">
                  <span className="hidden sm:inline">Fixes</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TRUST & LOCAL CREDIBILITY (Editorial Clean Proof List) ── */}
      <section className="section-pad bg-[#F7F7F7] border-y border-[#E5E5E5]">
        <div className="container-page grid gap-10 lg:grid-cols-12 items-center">
          {/* Left Column: Local Authority Copy */}
          <div className="lg:col-span-5 space-y-4">
            <span className="eyebrow">Local Standards</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
              Why Birkenhead Relies on Our Workshop
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#666666]">
              Unlike mail-in repair websites or remote warehouses, we are an established walk-in shop in Grange Precinct. You deal directly with the technician handling your hardware.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-2 shadow-2xs">
                <span className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider">Physical Shop</span>
                <strong className="text-sm font-bold text-[#171717]">16 Borough Pavement</strong>
              </div>
              <div className="rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-2 shadow-2xs">
                <span className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider">Opening</span>
                <strong className="text-sm font-bold text-[#171717]">Mon–Sat 9:00am–5:30pm</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Fact-Based Proof List with Dividers */}
          <div className="lg:col-span-7 rounded-xl border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5] overflow-hidden">
            <div className="p-5 flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm sm:text-base font-bold text-[#171717]">
                  No Fix, No Fee Diagnostic Guarantee
                </strong>
                <p className="mt-1 text-xs sm:text-sm text-[#666666] leading-relaxed">
                  If your phone, laptop or console cannot be repaired due to catastrophic board damage, you owe nothing for inspection.
                </p>
              </div>
            </div>

            <div className="p-5 flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-[#AC313F] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm sm:text-base font-bold text-[#171717]">
                  Tested Grade Parts with Store Warranty
                </strong>
                <p className="mt-1 text-xs sm:text-sm text-[#666666] leading-relaxed">
                  Display panels, charging docks and batteries are thoroughly tested for touch accuracy, brightness and charging current before handover.
                </p>
              </div>
            </div>

            <div className="p-5 flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-[#171717] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm sm:text-base font-bold text-[#171717]">
                  Direct Counter Technician Advice
                </strong>
                <p className="mt-1 text-xs sm:text-sm text-[#666666] leading-relaxed">
                  No remote call centers or shipping delays. Walk into our Borough Pavement shop and speak directly with our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: BUY & SELL USED DEVICES (Primary Retail Hierarchy) ── */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Device Trade-In &amp; Sales</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
              Trade In for Instant Cash or Buy Refurbished
            </h2>
            <p className="mt-2 text-base text-[#666666]">
              Upgrade your device affordably or turn unwanted phones, MacBooks and gaming consoles into instant cash on the counter.
            </p>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Sell Card (Primary High-Street Intent: 55% Width on Desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border-2 border-[#AC313F]/30 bg-[#F7F7F7] p-7 sm:p-8 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded bg-[#AC313F] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                  <ShoppingBag className="h-3.5 w-3.5" /> High-Street Payout
                </div>
                <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#171717] font-display">
                  Instant Cash Payout for Old or Broken Devices
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#555555]">
                  Bring your device to 16 Borough Pavement with valid photo ID. We test your phone, laptop or gaming console in minutes and pay cash or instant bank transfer.
                </p>
                <div className="mt-6 space-y-2.5 border-t border-[#E5E5E5] pt-4 text-xs font-semibold text-[#171717]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Working, cracked, locked or faulty devices accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Fair high-street valuation based on current UK market rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Full data sanitisation and memory wipe before recycling</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <Link
                  to="/buy-sell-used-phones-birkenhead"
                  className="btn-primary min-h-11 !px-6 !text-xs font-bold w-full justify-center sm:w-auto"
                >
                  Get a Valuation Enquiry <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="hidden sm:inline text-xs font-bold text-[#666666]">Counter payout</span>
              </div>
            </div>

            {/* Buy Card (Secondary High-Street Focus: 45% Width on Desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#252525] bg-[#171717] text-white p-7 sm:p-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded bg-[#252525] border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-[#AC313F]" /> Certified Stock
                </div>
                <h3 className="mt-4 text-xl sm:text-2xl font-extrabold text-white font-display">
                  Pre-Owned Phones &amp; Tech with Store Warranty
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/80">
                  Save hundreds on clean, unlocked iPhones, Samsung Galaxys, iPads and laptops. Every device passes a strict hardware inspection checklist.
                </p>
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs font-semibold text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#AC313F] shrink-0" />
                    <span>Network unlocked &amp; ready for any UK SIM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#AC313F] shrink-0" />
                    <span>Battery health and genuine camera verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#AC313F] shrink-0" />
                    <span>Store warranty included on every pre-owned handset</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10">
                <Link
                  to="/products"
                  className="btn-outline min-h-11 w-full justify-center !text-xs font-bold !bg-white !text-[#171717] !border-transparent hover:!bg-[#F7F7F7]"
                >
                  Browse Available Devices <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: IN-STORE STOCK SHOWCASE (3 Retail Category Zones, Not 6 Generic Cards) ── */}
      <section className="section-pad bg-[#F7F7F7] border-y border-[#E5E5E5]">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Counter Stock</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
                In-Store Tech Accessories &amp; Essentials
              </h2>
              <p className="mt-2 text-sm md:text-base text-[#666666]">
                Available across our display counters at 16 Borough Pavement for immediate walk-in purchase.
              </p>
            </div>
            <Link
              to="/products"
              className="flex min-h-11 items-center gap-2 text-sm font-bold text-[#AC313F] hover:text-[#782939] shrink-0"
            >
              Browse in-store products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3 Retail Category Zones */}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {/* Zone 1: Phone Cases & Protection */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#AC313F]">
                  Protection
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#171717] font-display">
                  Cases &amp; Screen Protection
                </h3>
                <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                  Shockproof drop cases for iPhone, Samsung Galaxy and Pixel, plus 9H tempered glass screen protectors.
                </p>

                <div className="mt-4 space-y-1.5 border-t border-[#E5E5E5] pt-3 text-xs text-[#171717]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">Tempered Glass Protectors</span>
                    <span className="text-[10px] font-bold text-[#10B981] bg-[#F7F7F7] px-1.5 py-0.5 rounded">Free Fitting</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">Shockproof Heavy-Duty Cases</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">In Stock</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Clear Silicone &amp; Folio Covers</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">iPhone / Galaxy</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E5E5E5] text-[11px] font-bold text-[#AC313F]">
                Free screen protector fitting at the counter
              </div>
            </div>

            {/* Zone 2: Fast Charging & Power */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#AC313F]">
                  Power &amp; Cables
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#171717] font-display">
                  Fast Chargers &amp; Power Essentials
                </h3>
                <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                  High-speed PD wall plugs, reinforced braided charging leads, and compact power banks for daily use.
                </p>

                <div className="mt-4 space-y-1.5 border-t border-[#E5E5E5] pt-3 text-xs text-[#171717]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">20W / 30W / 65W PD Fast Chargers</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">High Speed</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">Braided Lightning &amp; USB-C Cables</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">Heavy Duty</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Portable Emergency Power Banks</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">In Stock</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E5E5E5] text-[11px] font-bold text-[#666666]">
                Tested for safe, surge-protected charging
              </div>
            </div>

            {/* Zone 3: Audio & Daily Gear */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#AC313F]">
                  Audio &amp; Mounts
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#171717] font-display">
                  Wireless Audio &amp; In-Car Gear
                </h3>
                <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                  Bluetooth earbuds with noise isolation, wired earphones, magnetic in-car phone holders and adapters.
                </p>

                <div className="mt-4 space-y-1.5 border-t border-[#E5E5E5] pt-3 text-xs text-[#171717]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">Bluetooth Wireless Earbuds</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">With Mic</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F7F7F7]">
                    <span className="font-semibold">In-Car Magnetic Phone Mounts</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">Vent / Dash</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold">Audio &amp; OTG Headphone Adapters</span>
                    <span className="text-[10px] font-bold text-[#666666] bg-[#F7F7F7] px-1.5 py-0.5 rounded">Type-C / Aux</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E5E5E5] text-[11px] font-bold text-[#666666]">
                All items on display at our Birkenhead shop
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: HOW IT WORKS (Connected 3-Step Journey) ── */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Repair Process</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
              Simple 3-Step Repair Journey
            </h2>
            <p className="mt-2 text-sm md:text-base text-[#666666]">
              No complicated technical jargon or surprise invoices. Just clear pricing and honest turnaround times.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 bg-[#E5E5E5] z-0" />

            {[
              {
                step: "01",
                title: "1. Tell Us the Issue",
                desc: "Walk in to 16 Borough Pavement or use our quick price estimator online. No appointment needed for standard phone fixes.",
              },
              {
                step: "02",
                title: "2. Fixed Price Diagnosis",
                desc: "Our technician inspects your device and quotes an exact price before starting. If we cannot fix it, you pay nothing.",
              },
              {
                step: "03",
                title: "3. Express Fix & Collect",
                desc: "We install quality tested components, verify full functionality with you on counter, and hand over your repair warranty.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-6 shadow-2xs relative z-10"
              >
                <span className="inline-block rounded bg-[#171717] px-2.5 py-1 text-xs font-black text-white font-mono">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base font-bold text-[#171717] font-display">{step.title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#666666]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CUSTOMER REVIEWS (Editorial Split Layout) ── */}
      <section className="section-pad bg-[#F7F7F7] border-y border-[#E5E5E5]">
        <div className="container-page grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Review Summary */}
          <div className="lg:col-span-4 space-y-3">
            <span className="eyebrow">Local Feedback</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-display">
              Recommended by Birkenhead Locals
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-[#666666]">
              Real feedback from walk-in customers who had their phones, laptops and consoles serviced at our Borough Pavement counter.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-extrabold text-[#171717]">Verified Local Feedback</span>
            </div>
          </div>

          {/* Right Column: 2 Dominant Review Cards + 1 Supporting Quote */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.slice(0, 2).map((rev) => (
              <div
                key={rev.author}
                className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(rev.stars)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#AC313F] uppercase tracking-wider bg-[#F7F7F7] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {rev.verified}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#171717]">
                    "{rev.quote}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <strong className="font-bold text-[#171717]">{rev.author}</strong>
                  <span className="font-semibold text-[#666666]">{rev.location}</span>
                </div>
              </div>
            ))}
            {CUSTOMER_REVIEWS[2] && (
              <div className="sm:col-span-2 rounded-xl border border-[#E5E5E5] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <p className="text-[#171717] italic">
                  "{CUSTOMER_REVIEWS[2].quote}"
                </p>
                <div className="shrink-0 text-[#666666] font-medium sm:text-right">
                  <strong className="text-[#171717] font-bold">{CUSTOMER_REVIEWS[2].author}</strong> ({CUSTOMER_REVIEWS[2].location})
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: STORE VISIT, HOURS & LOCATION (High-Priority Conversion Section) ── */}
      <section className="section-pad bg-white" id="visit">
        <div className="container-page">
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Store Details & Opening Hours */}
            <div className="flex flex-col justify-center lg:col-span-6 space-y-5">
              <div>
                <span className="eyebrow">Visit Our Shop</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717] font-display">
                  Birkenhead Town Centre Counter
                </h2>
                <div className="mt-3 p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7]">
                  <strong className="block text-base font-bold text-[#171717]">{BUSINESS.name}</strong>
                  <address className="mt-1 text-sm not-italic leading-relaxed text-[#555555]">
                    16 Borough Pavement<br />
                    Grange Precinct<br />
                    Birkenhead, CH41 2XX
                  </address>
                  <p className="mt-2 text-xs font-semibold text-[#AC313F]">
                    Opposite Grange Precinct pedestrian shopping concourse
                  </p>
                </div>
              </div>

              {/* Opening Hours Table */}
              <div className="rounded-xl border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5] overflow-hidden">
                {BUSINESS.hours.map((item) => (
                  <div
                    key={item.day}
                    className="flex justify-between gap-5 px-4 py-3 text-xs sm:text-sm"
                  >
                    <span className="font-medium text-[#666666]">{item.day}</span>
                    <strong className="font-bold text-[#171717]">{item.time}</strong>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a href={BUSINESS.phoneHref} className="btn-dark min-h-12 w-full justify-center !text-xs font-bold">
                  <Phone className="h-4 w-4" /> Call {BUSINESS.phone}
                </a>
                <a
                  href={BUSINESS.mapsDirections}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary min-h-12 w-full justify-center !text-xs font-bold"
                >
                  <MapPin className="h-4 w-4" /> Get Directions
                </a>
              </div>
            </div>

            {/* Right Column: Embedded Google Map Visual */}
            <div className="lg:col-span-6 overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] shadow-xs">
              <div className="p-3 border-b border-[#E5E5E5] bg-white flex items-center justify-between text-xs">
                <span className="font-bold text-[#171717] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#AC313F]" /> Birkenhead Town Centre Map
                </span>
                <a
                  href={BUSINESS.mapsDirections}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#AC313F] hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
              <iframe
                title="Phone Shop Birkenhead Google Maps location"
                src={
                  BUSINESS.location.mapsEmbed ||
                  "https://maps.google.com/maps?q=16+Borough+Pavement,+Grange+Precinct,+Birkenhead+CH41+2XX&t=&z=16&ie=UTF8&iwloc=&output=embed"
                }
                className="h-[360px] sm:h-[400px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FINAL CONVERSION CTA BANNER ── */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight font-display">
            Need Your Device Fixed or Looking to Trade In?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            Walk into 16 Borough Pavement, Grange Precinct or call our counter for friendly, honest advice and express turnarounds.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-sm font-bold">
              Get an Instant Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-12 !px-6 !text-sm font-bold !bg-white/10 !text-white !border-white/20 hover:!bg-white hover:!text-[#171717]"
            >
              <Phone className="h-4 w-4 text-[#AC313F]" /> Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
