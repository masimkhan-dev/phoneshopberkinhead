import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gamepad2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  Tv,
  Fan,
  Disc,
  Power,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";
import { WhyChooseUs, FAQSection, RepairProcess } from "@/components/site/Sections";

export const Route = createFileRoute("/gaming-console-repair-birkenhead")({
  head: () => ({
    meta: [
      { title: "Gaming Console Repair in Birkenhead | PS5, Xbox & Switch Specialists" },
      {
        name: "description",
        content:
          "Gaming console repairs in Birkenhead at 16 Borough Pavement. PS5 and Xbox HDMI port replacements, overheating fan repairs, disc drive fixes and controller repairs.",
      },
      { property: "og:title", content: "Gaming Console Repair in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "PlayStation 5, Xbox Series X/S and Nintendo Switch repairs in Birkenhead. Precision HDMI soldering and internal servicing.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/gaming-console-repair-birkenhead` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/gaming-console-repair-birkenhead` }] : [],
  }),
  component: GamingConsoleRepairPage,
});

const CONSOLE_FAULTS = [
  {
    icon: Tv,
    title: "HDMI Port Replacement & Micro-Soldering",
    desc: "Fixed for consoles displaying 'No Signal' or bent, pushed-in pins inside the HDMI socket. We de-solder the broken socket and solder on a reinforced OEM port.",
    target: "PS5, PS4, Xbox Series X/S, Switch Dock",
  },
  {
    icon: Fan,
    title: "Overheating & Jet-Engine Fan Cleaning",
    desc: "Solve sudden shutdowns during gameplay. Full internal disassembly, dust extraction from heatsink fins, and replacement of degraded liquid metal or thermal paste.",
    target: "PlayStation 5 & Xbox Series X",
  },
  {
    icon: Power,
    title: "No Power & Sudden Shutdown Diagnostics",
    desc: "Testing of internal power supply units (PSU), shorted power rails, and blown board capacitors if your console beeps and immediately turns off.",
    target: "All Major Consoles",
  },
  {
    icon: Disc,
    title: "Optical Disc Drive & Feeder Repairs",
    desc: "Fix disc drives that won't take discs in, make grinding noises, or show 'Unrecognized Disc' errors with fresh roller belts and laser lens units.",
    target: "PS5 Disc Edition, PS4 & Xbox One",
  },
  {
    icon: Gamepad2,
    title: "Controller Stick Drift & Button Replacement",
    desc: "Replace drifting analog sticks with high-durability potentiometers on DualSense and Xbox Wireless controllers. Solder repairs for damaged triggers.",
    target: "PS5 DualSense & Xbox Wireless",
  },
  {
    icon: Zap,
    title: "Nintendo Switch USB-C Port & Screen Fixes",
    desc: "Broken charging ports, cracked touch digitizers, blank LCDs, and joy-con rail connection issues repaired on our Birkenhead workbench.",
    target: "Nintendo Switch & Switch OLED",
  },
];

function GamingConsoleRepairPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <PageHero
        eyebrow="Specialist Console Workshop • Birkenhead"
        title="Gaming Console Repairs in Birkenhead"
        description="Local workshop servicing for PlayStation 5, PlayStation 4, Xbox Series X/S and Nintendo Switch. We perform board-level HDMI port replacements, deep thermal cleaning, and disc drive repairs right at 16 Borough Pavement."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Get a Console Repair Quote <ArrowRight className="h-3.5 w-3.5" />
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
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Precision HDMI Micro-Soldering
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Store Warranty on All Fixes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#AC313F]" /> Fast Local Turnaround
            </span>
          </div>
        }
      />

      {/* Dark Ink Feature Band: Why In-Store Console Repair Matters */}
      <section className="bg-[#171717] text-white py-10 border-b border-[#252525]">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold text-[#AC313F] uppercase tracking-wider">
              No Risky Postal Mailing
            </span>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">
              Hand your console directly to the technician in Birkenhead
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
              Skip weeks of waiting and risk of transit damage with mail-away services. We test and diagnose your console on counter at 16 Borough Pavement.
            </p>
          </div>
          <Link to="/contact" className="btn-primary shrink-0 !text-xs font-bold">
            Drop In Your Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Specialist Hardware Faults Grid */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Console Services</span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
              Hardware Faults Fixed On-Site
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#666666]">
              All repaired systems undergo thorough functional testing on a gaming display before collection.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONSOLE_FAULTS.map((fault) => (
              <div
                key={fault.title}
                className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-6 hover:border-[#AC313F] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white border border-[#E5E5E5] text-[#AC313F]">
                      <fault.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-white border border-[#E5E5E5] px-2 py-0.5 text-[10px] font-bold text-[#171717]">
                      {fault.target}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-[#171717]">{fault.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#555555]">{fault.desc}</p>
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

      {/* Repair Process */}
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
              Get your console back in the game
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Bring your console to 16 Borough Pavement or give us a call for turnaround estimates and pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Console Enquiry <ArrowRight className="h-4 w-4" />
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
