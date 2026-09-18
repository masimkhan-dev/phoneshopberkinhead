import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS } from "@/lib/business";
import {
  WhyChooseUs,
  BrandsWeRepair,
  RepairProcess,
  WarrantyBanner,
  FAQSection,
} from "@/components/site/Sections";

export interface SeoLandingProps {
  Icon: LucideIcon;
  eyebrow: string;
  h1: string;
  intro: string;
  services: string[];
  whatsappMessage: string;
  showBrands?: boolean;
}

export function SeoLanding({
  Icon,
  eyebrow,
  h1,
  intro,
  services,
  whatsappMessage,
  showBrands = true,
}: SeoLandingProps) {
  return (
    <SiteLayout>
      <section className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#171717] py-14 md:py-18">
        <div className="container-page grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <span className="eyebrow !text-[#AC313F] !bg-white !border-[#E5E5E5]">{eyebrow}</span>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-[#171717] max-w-3xl leading-tight">
              {h1}
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#666666] max-w-2xl leading-relaxed">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary min-h-11">
                Get a Repair Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="btn-outline min-h-11 !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F]"
              >
                <Phone className="w-4 h-4 text-[#AC313F]" /> Call {BUSINESS.phone}
              </a>
              {BUSINESS.whatsapp && (
                <a
                  href={BUSINESS.whatsappMessage(whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp min-h-11"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Shop
                </a>
              )}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <MapPin className="w-4 h-4 text-[#AC313F]" /> {BUSINESS.fullAddress}
            </div>
          </div>
          <div className="hidden lg:flex w-52 h-52 rounded-3xl bg-white border border-[#E5E5E5] items-center justify-center shadow-sm">
            <Icon className="w-24 h-24 text-[#AC313F]" />
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#F7F7F7]">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">Repairs Covered</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717]">
              Common Repairs &amp; Hardware Services
            </h2>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s}
                className="flex items-start gap-3 rounded-xl bg-white border border-[#E5E5E5] p-4 shadow-xs hover:border-[#AC313F] transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-[#AC313F] mt-0.5 shrink-0" />
                <span className="text-sm font-bold text-[#171717]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RepairProcess />
      <WarrantyBanner />
      <WhyChooseUs />
      {showBrands && <BrandsWeRepair />}
      <FAQSection />
    </SiteLayout>
  );
}
