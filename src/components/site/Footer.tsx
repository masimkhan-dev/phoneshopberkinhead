import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, ArrowUpRight } from "lucide-react";
import { BUSINESS, LEGAL_LINKS, NAV_LINKS } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="mt-8 md:mt-12 bg-[#171717] text-white pb-20 md:pb-0">
      {/* ── Integrated Reassurance Strip Above Footer ── */}
      <div className="border-y border-white/10 bg-[#252525] py-3 text-xs">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-white/90 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#AC313F] shrink-0" />
            <span className="font-bold text-white">Birkenhead’s Trusted Tech &amp; Phone Specialists</span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span className="hidden sm:inline">16 Borough Pavement, Grange Precinct</span>
            <span className="hidden sm:inline">•</span>
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-1.5 font-bold text-[#AC313F] hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5" /> {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Footer Columns (20% More Compact) ── */}
      <div className="container-page grid gap-8 py-10 md:py-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.1fr_1.3fr]">
        {/* Column 1: Strong Brand & Local Identity */}
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-3">
            {SITE_MEDIA.logo ? (
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#252525] border border-white/10 p-1 shadow-xs">
                <img src={SITE_MEDIA.logo} alt={BUSINESS.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#AC313F] text-white font-black text-sm shadow-xs">
                PSB
              </span>
            )}
            <div>
              <strong className="block font-display text-xl font-extrabold tracking-tight text-white">
                {BUSINESS.name}
              </strong>
              <span className="text-xs font-semibold text-[#AB5163]">{BUSINESS.tagline}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-white/80">
            Professional express repairs for smartphones, tablets, laptops and gaming consoles in Birkenhead town centre. Pre-owned devices bought and sold with warranty.
          </p>

          {/* Contextual Action Buttons (Call Now & Directions) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a href={BUSINESS.phoneHref} className="btn-primary min-h-11 !px-4 !text-xs font-bold !rounded-lg">
              <Phone className="h-3.5 w-3.5" /> Call Now
            </a>
            <a
              href={BUSINESS.mapsDirections}
              target="_blank"
              rel="noreferrer"
              className="btn-outline min-h-11 !px-3.5 !text-xs font-bold !rounded-lg !bg-white/10 !text-white !border-white/30 hover:!bg-white hover:!text-[#171717]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#AC313F]" /> Directions
            </a>
            {BUSINESS.whatsapp && (
              <a
                href={BUSINESS.whatsappMessage("Hi Phone Shop Birkenhead, I have an enquiry.")}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp min-h-11 !px-3.5 !text-xs font-bold !rounded-lg"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[.08em] text-white">
            Explore
          </h3>
          <div className="mt-3.5 grid gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Repair Services */}
        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[.08em] text-white">
            Services
          </h3>
          <div className="mt-3.5 grid gap-1">
            <Link
              to="/mobile-phone-repair-birkenhead"
              className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
            >
              Mobile Phone Repairs
            </Link>
            <Link
              to="/laptop-computer-repair-birkenhead"
              className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
            >
              Laptop &amp; PC Repairs
            </Link>
            <Link
              to="/gaming-console-repair-birkenhead"
              className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
            >
              Gaming Console Repairs
            </Link>
            <Link
              to="/buy-sell-used-phones-birkenhead"
              className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
            >
              Sell Your Device (Cash)
            </Link>
            <Link
              to="/products"
              className="flex min-h-[36px] items-center text-xs font-medium text-white/85 hover:text-[#AC313F] transition-colors"
            >
              Tech Accessories
            </Link>
          </div>
        </div>

        {/* Column 4: Store Location & Opening Hours */}
        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[.08em] text-white">
            Store Location
          </h3>
          <div className="mt-3.5 space-y-3 text-xs leading-relaxed">
            <a
              href={BUSINESS.mapsDirections}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2.5 text-white/85 hover:text-white transition-colors"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#AC313F]" />
              <span>
                {BUSINESS.addressLine},<br />
                {BUSINESS.area}, {BUSINESS.city},<br />
                {BUSINESS.postcode}
              </span>
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2.5 text-white/85 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#AC313F]" />
              <span className="font-bold text-white">{BUSINESS.phone}</span>
            </a>
            <div className="flex items-start gap-2.5 text-white/75 pt-1 border-t border-white/10">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#AC313F]" />
              <span>
                Mon–Sat: 9:00 AM – 5:30 PM<br />
                Sun: Closed
              </span>
            </div>
            {BUSINESS.email && (
              <a
                href={BUSINESS.emailHref}
                className="flex items-center gap-2.5 break-all text-white/80 hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#AC313F]" />
                <span>{BUSINESS.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Sub-Footer Legal Strip ── */}
      <div className="border-t border-white/10 bg-[#252525]">
        <div className="container-page flex flex-col gap-3 py-4 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved. 16 Borough Pavement, Birkenhead.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-[32px] items-center font-medium hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
