import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Laptop,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  HardDrive,
  Cpu,
  Monitor,
  BatteryCharging,
  Flame,
  FileCode2,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";
import { WhyChooseUs, FAQSection, RepairProcess } from "@/components/site/Sections";

export const Route = createFileRoute("/laptop-computer-repair-birkenhead")({
  head: () => ({
    meta: [
      { title: "Laptop & PC Repair in Birkenhead | Mac & Windows Specialists" },
      {
        name: "description",
        content:
          "Professional laptop and computer repairs in Birkenhead. MacBook, Dell, HP, Lenovo screens, SSD speedups, battery replacement and hardware diagnostics at 16 Borough Pavement.",
      },
      { property: "og:title", content: "Laptop & PC Repair in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "Hardware repairs and upgrades for MacBooks, Windows laptops and desktop computers in Birkenhead.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/laptop-computer-repair-birkenhead` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/laptop-computer-repair-birkenhead` }] : [],
  }),
  component: LaptopRepairPage,
});

const LAPTOP_SERVICES = [
  {
    icon: Monitor,
    title: "Broken Screen & Hinge Repair",
    desc: "Replacement of cracked LCD/IPS displays, flickering screens, damaged ribbon cables, and broken laptop lid hinges for all brands.",
  },
  {
    icon: HardDrive,
    title: "High-Speed SSD Upgrades",
    desc: "Breathe new life into sluggish laptops by replacing old mechanical hard drives with lightning-fast Solid State Drives (SSDs).",
  },
  {
    icon: BatteryCharging,
    title: "Laptop Battery & Power Jack Fixes",
    desc: "Replacement of swollen or depleted internal laptop batteries, loose charging pins, USB-C Power Delivery ports, and AC adapters.",
  },
  {
    icon: Flame,
    title: "Overheating & Thermal Paste Servicing",
    desc: "Loud fans and sudden thermal shutdowns fixed. Full internal dust extraction and fresh thermal compound applied to CPU & GPU chips.",
  },
  {
    icon: Cpu,
    title: "Motherboard & Diagnostic Assessments",
    desc: "No-power faults, liquid spill inspection, and component-level board diagnostics. If your device cannot be saved, you pay no diagnostic fee.",
  },
  {
    icon: FileCode2,
    title: "Windows & macOS Software Cleanup",
    desc: "Operating system reinstall, driver conflicts, boot loop repairs, and malware removal without wiping your important family photos or documents.",
  },
];

function LaptopRepairPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <PageHero
        eyebrow="Computer Workshop • Birkenhead"
        title="Laptop & PC Repairs in Birkenhead"
        description="Hardware servicing for MacBooks, Windows laptops and desktop computers at 16 Borough Pavement. From cracked panels to fast SSD speedups and logic board repairs."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Get a Laptop Repair Quote <ArrowRight className="h-3.5 w-3.5" />
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
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> MacBook &amp; Windows PCs
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Store Warranty on Parts
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#AC313F]" /> Fast Diagnostics
            </span>
          </div>
        }
      />

      {/* Services Grid (Structured for Computer Hardware) */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Hardware Services</span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
              Computer &amp; Laptop Problems We Solve
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#666666]">
              Walk in with your laptop and power adapter for a fast evaluation at 16 Borough Pavement.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LAPTOP_SERVICES.map((srv) => (
              <div
                key={srv.title}
                className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-6 hover:border-[#AC313F] transition-all"
              >
                <div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white border border-[#E5E5E5] text-[#AC313F]">
                    <srv.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-[#171717]">{srv.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#555555]">{srv.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <span className="text-[#666666] font-medium">Workshop repair</span>
                  <Link to="/contact" className="font-bold text-[#AC313F] hover:underline flex items-center gap-1">
                    Book fix <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <RepairProcess />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* FAQs */}
      <FAQSection />

      {/* Bottom Conversion CTA */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Need your laptop running smoothly again?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Drop by 16 Borough Pavement or give our technicians a call for straightforward advice and quotes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Get an Inspection Quote <ArrowRight className="h-4 w-4" />
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
