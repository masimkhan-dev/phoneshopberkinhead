import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Users,
  Wrench,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { SITE_MEDIA } from "@/lib/site-content";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { WhyChooseUs, FAQSection } from "@/components/site/Sections";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Phone Shop Birkenhead | Local Tech & Repair Specialists" },
      {
        name: "description",
        content:
          "Independent mobile phone, computer and console repair specialists at 16 Borough Pavement, Grange Precinct, Birkenhead. Honest advice, quality parts and store warranty.",
      },
      { property: "og:title", content: "About Phone Shop Birkenhead | Local Repair Specialists" },
      {
        property: "og:description",
        content: "Independent mobile, laptop and gaming repairs in Birkenhead town centre.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/about` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/about` }] : [],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    icon: Wrench,
    title: "Practical Hardware Expertise",
    desc: "From delicate micro-soldering on console HDMI ports to high-grade smartphone display swaps, our technicians diagnose and repair hardware on-site.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Replacement Parts",
    desc: "We use vibrant OLED/LCD panels, fresh batteries and solid replacement charging ports backed by our store warranty.",
  },
  {
    icon: Heart,
    title: "Honest High-Street Advice",
    desc: "If a repair is uneconomical or the device is beyond practical recovery, we tell you straight. No fix, no fee diagnostic assessment on standard jobs.",
  },
  {
    icon: Users,
    title: "Established Birkenhead Counter",
    desc: "No sending your device into the postal void. You hand your phone or laptop directly to the person who works on it at 16 Borough Pavement.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <PageHero
        eyebrow="Local Workshop Story • Birkenhead"
        title="Your Friendly High-Street Tech Specialist"
        description="Phone Shop Birkenhead provides honest, high-street repairs for smartphones, laptops, MacBooks, and gaming consoles, alongside pre-owned devices and accessories."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Visit Our Shop <ArrowRight className="h-3.5 w-3.5" />
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
              <MapPin className="h-3.5 w-3.5 text-[#AC313F]" /> 16 Borough Pavement, Birkenhead
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#10B981]" /> Mon–Sat 9:00am–5:30pm
            </span>
          </div>
        }
      />

      {/* Editorial Story Split Section */}
      <section className="section-pad bg-white">
        <div className="container-page grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="eyebrow">Local Commitment</span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] leading-tight">
              A Real Shop Counter for Everyday Tech Emergencies
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#555555]">
              Modern smartphones and computers keep our daily lives moving—from work and banking to staying in touch with family. When your screen shatters or your console stops displaying video, you need prompt, accountable service right here in Birkenhead.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#555555]">
              We set up Phone Shop Birkenhead at 16 Borough Pavement (opposite Grange Precinct) to give Wirral residents a dependable alternative to impersonal courier repairs and overpriced manufacturer waitlists.
            </p>

            <div className="pt-3 grid sm:grid-cols-2 gap-3 text-xs font-semibold text-[#171717]">
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Walk-in repairs with no appointment</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] p-3">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>All work backed by store warranty</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] p-4 overflow-hidden shadow-xs">
              <img
                src={SITE_MEDIA.shopfront.src}
                alt="Workshop and technician bench at Phone Shop Birkenhead"
                loading="lazy"
                decoding="async"
                className="rounded-xl w-full aspect-[4/3] object-cover object-center"
              />
              <div className="p-3 text-center text-xs text-[#666666]">
                Technician workbench at 16 Borough Pavement, Birkenhead
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="section-pad bg-[#F7F7F7] border-y border-[#E5E5E5]">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Our Standards</span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#171717]">
              How We Approach Every Job
            </h2>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs hover:border-[#AC313F] transition-all"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F]">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-[#171717]">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#555555]">{p.desc}</p>
              </div>
            ))}
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
              Visit our Birkenhead shop
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Open Monday to Saturday from 9:00 AM to 5:30 PM. Walk in anytime for free advice and repair quotes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Find Our Counter <ArrowRight className="h-4 w-4" />
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
