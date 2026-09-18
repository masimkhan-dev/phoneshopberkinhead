import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  Zap,
  Wrench,
  Camera,
  BatteryCharging,
  Volume2,
  Droplet,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";
import { WhyChooseUs, BrandsWeRepair, FAQSection, RepairProcess } from "@/components/site/Sections";

export const Route = createFileRoute("/mobile-phone-repair-birkenhead")({
  head: () => ({
    meta: [
      { title: "Mobile Phone Repair in Birkenhead | Screen & Battery Specialists" },
      {
        name: "description",
        content:
          "Fast mobile phone repairs in Birkenhead at 16 Borough Pavement. iPhone, Samsung, Pixel screens, batteries, charging ports and water damage diagnostics.",
      },
      { property: "og:title", content: "Mobile Phone Repair in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "Expert mobile phone repairs in Grange Precinct, Birkenhead. Display replacement, battery renewal and port fixes.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/mobile-phone-repair-birkenhead` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/mobile-phone-repair-birkenhead` }] : [],
  }),
  component: MobilePhoneRepairPage,
});

const MOBILE_SERVICES = [
  {
    icon: Smartphone,
    title: "Screen & OLED Replacement",
    desc: "Fixed for cracked outer glass, unresponsive touch, vertical lines, or blank screens. We fit premium grade displays with accurate color calibration and touch responsiveness.",
    badge: "Popular Service",
  },
  {
    icon: BatteryCharging,
    title: "Battery Health Replacement",
    desc: "Replace old batteries that drain fast, shut down unexpectedly, or refuse to hold charge. Fresh high-capacity cells restored to 100% health.",
    badge: "Fast Turnaround",
  },
  {
    icon: Zap,
    title: "Charging Port Repair & Cleaning",
    desc: "Solve loose cables that fall out, slow charging, or unrecognised accessories. Lint extraction or socket replacement carried out in store.",
    badge: "Fast Fix",
  },
  {
    icon: Camera,
    title: "Front & Rear Camera Fixes",
    desc: "Resolve blurry lenses, cracked camera glass, autofocus failure, or black screens when opening the camera app.",
    badge: "Precision",
  },
  {
    icon: Volume2,
    title: "Earpiece & Speaker Repair",
    desc: "Fix muffled phone calls, quiet speakers, or broken microphones so callers can hear you clearly again.",
    badge: "Audio Fix",
  },
  {
    icon: Droplet,
    title: "Liquid Damage Diagnostics",
    desc: "Ultrasonic cleaning and board inspection for phones dropped in water or exposed to liquid. We diagnose internal corrosion before it destroys your logic board.",
    badge: "Diagnosis",
  },
];

function MobilePhoneRepairPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <PageHero
        eyebrow="Smartphone Workshop • Birkenhead"
        title="Mobile Phone Repairs in Birkenhead"
        description="Cracked screens, dying batteries and charging issues fixed with care at 16 Borough Pavement. We stock quality replacement components for Apple iPhone, Samsung Galaxy, Google Pixel, and more."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Request a Repair Quote <ArrowRight className="h-3.5 w-3.5" />
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
              <Clock className="h-3.5 w-3.5 text-[#AC313F]" /> Same-Day Screen Repairs
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Store Warranty Included
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Walk-Ins Welcome
            </span>
          </div>
        }
      />

      {/* Common Mobile Repairs Grid */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Repair Solutions</span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
              Common Phone Problems We Solve
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#666666]">
              All repairs are tested thoroughly on counter before you leave our Birkenhead shop.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOBILE_SERVICES.map((srv) => (
              <div
                key={srv.title}
                className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-6 hover:border-[#AC313F] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white border border-[#E5E5E5] text-[#AC313F]">
                      <srv.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-white border border-[#E5E5E5] px-2 py-0.5 text-[11px] font-bold text-[#171717]">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-[#171717]">{srv.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#555555]">{srv.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <span className="text-[#666666] font-medium">In-store repair</span>
                  <Link to="/contact" className="font-bold text-[#AC313F] hover:underline flex items-center gap-1">
                    Enquire <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Repair Process */}
      <RepairProcess />

      {/* Supported Brands */}
      <BrandsWeRepair />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* FAQs */}
      <FAQSection />

      {/* Call to action */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Ready to get your phone fixed?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Walk into 16 Borough Pavement, Grange Precinct or call our team for an exact price on your device model.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Book or Enquire <ArrowRight className="h-4 w-4" />
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
