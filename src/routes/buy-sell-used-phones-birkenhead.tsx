import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone,
  MessageCircle,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Trash2,
  FileCheck,
  Clock,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { WhyChooseUs, FAQSection } from "@/components/site/Sections";

export const Route = createFileRoute("/buy-sell-used-phones-birkenhead")({
  head: () => ({
    meta: [
      { title: "Buy & Sell Used Phones in Birkenhead | Instant Cash & Refurbished" },
      {
        name: "description",
        content:
          "Buy and sell smartphones, tablets and tech in Birkenhead. Instant cash on counter at 16 Borough Pavement or buy tested pre-owned devices backed by store warranty.",
      },
      { property: "og:title", content: "Buy & Sell Used Phones in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "Instant cash offers for used phones and tested pre-owned devices for sale in Birkenhead town centre.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/buy-sell-used-phones-birkenhead` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/buy-sell-used-phones-birkenhead` }] : [],
  }),
  component: BuySellPage,
});

const SELL_STEPS = [
  {
    step: "1",
    title: "Bring Your Device & ID",
    desc: "Walk into 16 Borough Pavement with your phone, tablet or console. Remember to bring a valid photo ID (driving licence or passport).",
  },
  {
    step: "2",
    title: "Quick Counter Evaluation",
    desc: "Our technician inspects battery health, screen condition, cameras, and connectivity. We assess working, cracked, or faulty devices.",
  },
  {
    step: "3",
    title: "Immediate Payout & Data Wipe",
    desc: "Accept our fair valuation offer and receive instant cash or faster bank transfer. We permanently wipe personal data for your security.",
  },
];

const BUY_STANDARDS = [
  {
    title: "Hardware Tested Before Sale",
    desc: "Every pre-owned device completes comprehensive diagnostic testing on touch, microphone, speakers, cameras, and charging ports.",
  },
  {
    title: "Network Unlocked",
    desc: "Our smartphones are unlocked and ready to use immediately with any UK network provider (Vodafone, EE, O2, Three, giffgaff).",
  },
  {
    title: "Store Warranty Included",
    desc: "Every pre-owned handset comes with a clear store warranty to protect you against hardware defects post-purchase.",
  },
  {
    title: "Genuine Savings",
    desc: "Save significantly compared to high-street brand-new contract pricing, without locking yourself into expensive 24-month commitments.",
  },
];

function BuySellPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <PageHero
        eyebrow="Retail Trade-In Counter • Birkenhead"
        title="Buy & Sell Phones in Birkenhead"
        description="Turn your unwanted tech into immediate cash on the counter, or pick up a tested pre-owned smartphone backed by store warranty. Simple, transparent high-street service."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Enquire About Device Value <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-11 !px-4 !text-xs font-bold !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F]"
            >
              <Phone className="h-3.5 w-3.5 text-[#AC313F]" /> Call {BUSINESS.phone}
            </a>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#555555]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Cash or Instant Bank Payout
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Tested Refurbished Phones
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5 text-[#AC313F]" /> Full Data Sanitisation
            </span>
          </div>
        }
      />

      {/* Two Dedicated Retail Counter Tracks: SELL vs BUY */}
      <section className="section-pad bg-white">
        <div className="container-page grid lg:grid-cols-2 gap-8 items-stretch">
          {/* TRACK 1: SELL YOUR PHONE */}
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F7] p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#AC313F] px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  <ShoppingBag className="h-3.5 w-3.5" /> Track 1
                </span>
                <span className="text-xs font-bold text-[#171717]">Instant Payout</span>
              </div>

              <h2 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
                Sell Your Phone or Tech for Cash
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#555555]">
                We buy working, cosmetically worn, or faulty smartphones, tablets, laptops and gaming consoles. Walk in for an immediate counter appraisal.
              </p>

              {/* 3-Step Counter Trade Process */}
              <div className="mt-7 space-y-4">
                {SELL_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-3.5 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-2xs">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#171717] font-mono text-xs font-bold text-white">
                      {step.step}
                    </span>
                    <div>
                      <strong className="block text-xs font-bold text-[#171717]">{step.title}</strong>
                      <p className="mt-1 text-xs text-[#666666] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4">
              <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold w-full sm:w-auto justify-center">
                Get a Trade-In Quote <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-xs font-semibold text-[#666666]">Photo ID required</span>
            </div>
          </div>

          {/* TRACK 2: BUY REFURBISHED PHONE */}
          <div className="rounded-2xl border-2 border-[#252525] bg-[#171717] text-white p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#252525] border border-white/10 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-[#AC313F]" /> Track 2
                </span>
                <span className="text-xs font-bold text-white/80">Store Warranty</span>
              </div>

              <h2 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-white">
                Buy a Tested Pre-Owned Device
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Pick up a clean, unlocked smartphone without the eye-watering brand-new price tag. Tested thoroughly across all components and ready to take home today.
              </p>

              {/* 4 Standards */}
              <div className="mt-7 space-y-3.5">
                {BUY_STANDARDS.map((std) => (
                  <div key={std.title} className="rounded-xl border border-white/10 bg-[#252525] p-4">
                    <strong className="block text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#AC313F]" /> {std.title}
                    </strong>
                    <p className="mt-1 text-xs text-white/70 leading-relaxed">{std.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <Link to="/products" className="btn-outline min-h-11 !px-5 !text-xs font-bold w-full sm:w-auto justify-center !bg-white !text-[#171717] !border-transparent hover:!bg-[#F7F7F7]">
                Browse Store Stock <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-xs font-semibold text-white/70">Unlocked &amp; Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* FAQs */}
      <FAQSection />

      {/* Bottom Visit Banner */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Have a device to sell or trade in?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Walk into 16 Borough Pavement with your device and ID for an instant evaluation and fast payout.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Enquire Today <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-12 !px-5 !text-xs font-bold !bg-white/10 !text-white !border-white/20 hover:!bg-white hover:!text-[#171717]"
            >
              <Phone className="h-4 w-4 text-[#AC313F]" /> Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
