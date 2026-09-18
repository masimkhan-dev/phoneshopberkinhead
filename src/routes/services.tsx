import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone,
  Laptop,
  Gamepad2,
  MessageCircle,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Wrench,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";
import {
  WhyChooseUs,
  BrandsWeRepair,
  WarrantyBanner,
  FAQSection,
  RepairProcess,
} from "@/components/site/Sections";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Mobile, Laptop & Gaming Repairs in Birkenhead | Phone Shop Birkenhead" },
      {
        name: "description",
        content:
          "Expert mobile phone, laptop, PC and gaming console repairs in Birkenhead. Screens, batteries, ports, diagnostics and hardware servicing at 16 Borough Pavement.",
      },
      { property: "og:title", content: "Mobile, Laptop & Gaming Repairs in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "Professional high-street repairs for phones, laptops, MacBooks and gaming consoles at 16 Borough Pavement, Birkenhead.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/services` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/services` }] : [],
  }),
  component: ServicesPage,
});

const SERVICE_CATEGORIES = [
  {
    id: "mobile",
    title: "Mobile Phone Repairs",
    tagline: "Same-Day Screen & Battery Replacements",
    description:
      "From shattered OLED displays and depleted batteries to broken charging ports and liquid damage inspection, our Birkenhead counter services all major phone models.",
    link: "/mobile-phone-repair-birkenhead",
    linkText: "Explore Phone Repair Options",
    icon: Smartphone,
    image: SITE_MEDIA.products.phone,
    turnaround: "Fast Express Service",
    highlights: [
      "OLED & LCD display renewal with touch sensitivity preserved",
      "Fresh high-capacity battery installation",
      "Charging port cleaning, socket replacement & microphone fixes",
      "Front & rear camera glass replacement",
      "No fix, no fee diagnostic assessment",
    ],
  },
  {
    id: "computer",
    title: "Laptop & Computer Repairs",
    tagline: "Hardware Diagnostics & Component Upgrades",
    description:
      "MacBook and Windows PC servicing at our Borough Pavement workshop. We resolve broken panels, overheating fans, failing drives, and software startup failures.",
    link: "/laptop-computer-repair-birkenhead",
    linkText: "Explore Laptop & PC Repairs",
    icon: Laptop,
    image: SITE_MEDIA.products.laptop,
    turnaround: "Same-Day / Next-Day",
    highlights: [
      "Cracked laptop screen replacement & hinge repairs",
      "High-speed SSD upgrades and data migration",
      "Thermal paste renewal & fan dust extraction",
      "Keyboard, trackpad and charging socket fixes",
      "Operating system reinstall & malware cleanup",
    ],
  },
  {
    id: "gaming",
    title: "Gaming Console Repairs",
    tagline: "HDMI Port & Internal Hardware Specialists",
    description:
      "Specialist repair workshop for PlayStation 5, Xbox Series X/S, and Nintendo Switch consoles. No need to post your expensive system away to an unknown warehouse.",
    link: "/gaming-console-repair-birkenhead",
    linkText: "Explore Console Repairs",
    icon: Gamepad2,
    image: SITE_MEDIA.products.console,
    turnaround: "Fast Turnaround",
    highlights: [
      "HDMI port replacements & micro-soldering",
      "Overheating fan repair & liquid metal / paste servicing",
      "Optical disc drive repairs & laser swaps",
      "Controller stick drift fixes & button replacement",
      "Power supply diagnostics & board repairs",
    ],
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      {/* Internal Page Hero */}
      <PageHero
        eyebrow="Birkenhead Workshop Services"
        title="Professional Device Repairs in Birkenhead"
        description="Fast, dependable hardware repairs for smartphones, laptops, computers and gaming consoles. Walk in to 16 Borough Pavement with no booking required."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Get a Repair Quote <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-11 !px-4 !text-xs font-bold !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F]"
            >
              <Phone className="h-3.5 w-3.5 text-[#AC313F]" /> Call {BUSINESS.phone}
            </a>
          </>
        }
      />

      {/* Main Service Directory: Image-Led Asymmetric Category Bands */}
      <section className="section-pad bg-white">
        <div className="container-page space-y-10">
          {SERVICE_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              id={cat.id}
              className={`rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] p-6 sm:p-8 lg:p-10 grid lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Side (Col 1-7) */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E5E5E5] px-2.5 py-1 text-xs font-bold text-[#AC313F]">
                    <cat.icon className="h-3.5 w-3.5" /> {cat.tagline}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#171717] px-2.5 py-1 text-xs font-bold text-white">
                    <Clock className="h-3 w-3 text-[#AC313F]" /> {cat.turnaround}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
                  {cat.title}
                </h2>

                <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#555555]">
                  {cat.description}
                </p>

                <div className="mt-6 border-t border-[#E5E5E5] pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Common Issues Fixed
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {cat.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs font-medium text-[#171717]">
                        <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to={cat.link} className="btn-primary min-h-11 !px-5 !text-xs font-bold">
                    {cat.linkText} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {BUSINESS.whatsapp && (
                    <a
                      href={BUSINESS.whatsappMessage(`Hi Phone Shop Birkenhead, I would like a quote for ${cat.title}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp min-h-11 !px-4 !text-xs font-bold"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Quote
                    </a>
                  )}
                </div>
              </div>

              {/* Visual Side (Col 8-12) */}
              <div className={`lg:col-span-5 ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}>
                <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs aspect-[4/3]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RepairProcess />
      <WarrantyBanner />
      <WhyChooseUs />
      <BrandsWeRepair />
      <FAQSection />

      {/* Immediate Diagnostics Banner */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Not sure which repair your device needs?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Walk into our 16 Borough Pavement counter for honest inspection and advice. If we cannot fix it, you pay nothing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Visit or Contact Us <ArrowRight className="h-4 w-4" />
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
