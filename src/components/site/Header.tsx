import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Menu, Phone, X } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";

const NAV_LEFT = [
  { to: "/services", label: "Services" },
  { to: "/buy-sell-used-phones-birkenhead", label: "Buy & Sell" },
  { to: "/products", label: "Products" },
] as const;

const NAV_RIGHT = [
  { to: "/about", label: "About Us" },
] as const;

const ALL_NAV_ITEMS = [
  { to: "/services", label: "Services" },
  { to: "/buy-sell-used-phones-birkenhead", label: "Buy & Sell" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open)
      return () => {
        document.body.style.overflow = "";
      };

    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        {/* Slim Top Utility Bar (Deep Wine Tone) */}
        <div className="border-b border-[#4A1624] bg-[#2A0D16] text-[#D8B3BC] text-xs">
          <div className="container-page flex h-[32px] items-center justify-between gap-4 text-[11px]">
            {/* Left: Location & Hours */}
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center gap-1 rounded bg-[#AC313F] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shrink-0">
                <MapPin className="h-2.5 w-2.5" /> Birkenhead
              </span>
              <span className="font-medium text-[#D8B3BC] truncate">
                16 Borough Pavement, Grange Precinct • Mon–Sat 9:00am–5:30pm
              </span>
            </div>

            {/* Right: Phone link */}
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-1.5 font-bold text-[#E8A0B0] hover:text-white transition-colors"
                aria-label={`Call ${BUSINESS.name} at ${BUSINESS.phone}`}
              >
                <Phone className="h-3 w-3 text-[#E8A0B0]" />
                <span>{BUSINESS.phone}</span>
              </a>
            </div>

            {/* Mobile tap-to-call direct */}
            <a
              href={BUSINESS.phoneHref}
              className="sm:hidden flex items-center gap-1 font-bold text-[#E8A0B0] hover:text-white shrink-0"
              aria-label="Call phone shop directly"
            >
              <Phone className="h-3 w-3 text-[#E8A0B0]" />
              <span>Call Shop</span>
            </a>
          </div>
        </div>

        {/* Grand Navigation Bar — Deep Wine Background (#38131E) with Prominent Centered Transparent Logo */}
        <div className="border-b border-[#4A1624] bg-[#38131E] transition-all duration-150">
          <div className="container-page relative flex h-[100px] sm:h-[112px] md:h-[124px] items-center justify-between">
            {/* Mobile Left: Circular Menu Trigger */}
            <div className="flex items-center md:hidden">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-12 w-12 place-items-center rounded-full bg-[#4A1624] text-[#E8A0B0] hover:bg-[#5A1C2C] active:scale-95 transition-all cursor-pointer shadow-xs"
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop Left Nav Links */}
            <nav className="hidden md:flex flex-1 items-center justify-start gap-6 lg:gap-10" aria-label="Left navigation">
              {NAV_LEFT.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[14px] lg:text-[15px] font-semibold text-[#D8B3BC] hover:text-white transition-colors duration-150 whitespace-nowrap"
                  activeProps={{ className: "!text-[#E8A0B0] !font-bold" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Dead-Center Brand Logo: Large Pure Transparent Image (No background box, no text) */}
            <div className="flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
              <Link
                to="/"
                className="flex items-center justify-center group transition-transform duration-200 hover:scale-[1.04]"
                aria-label={`${BUSINESS.name} home`}
              >
                {SITE_MEDIA.logo ? (
                  <img
                    src={SITE_MEDIA.logo}
                    alt={BUSINESS.name}
                    className="h-[74px] sm:h-[88px] md:h-[102px] lg:h-[112px] w-auto max-w-[260px] sm:max-w-[340px] md:max-w-[420px] object-contain select-none drop-shadow-sm"
                  />
                ) : (
                  <span className="font-display text-2xl md:text-3xl font-black text-[#E8A0B0] uppercase tracking-tight">
                    {BUSINESS.shortName}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Right Nav Links & Pill CTA Button */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-5 lg:gap-8">
              <nav className="flex items-center gap-6 lg:gap-8" aria-label="Right navigation">
                {NAV_RIGHT.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-[13px] lg:text-[14px] font-semibold text-[#D8B3BC] hover:text-white transition-colors duration-150 whitespace-nowrap"
                    activeProps={{ className: "!text-[#E8A0B0] !font-bold" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Counter Phone Link */}
              <a
                href={BUSINESS.phoneHref}
                className="hidden xl:flex items-center gap-1.5 text-[13px] font-semibold text-[#D8B3BC] hover:text-[#E8A0B0] transition-colors whitespace-nowrap"
                aria-label={`Call ${BUSINESS.phone}`}
              >
                <Phone className="h-3.5 w-3.5 text-[#E8A0B0]" />
                <span>{BUSINESS.phone}</span>
              </a>

              {/* Pill-shaped Contact Us Button (#E8A0B0 bg with #38131E text) */}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-[#E8A0B0] hover:bg-[#F2B5C3] text-[#38131E] font-bold text-xs sm:text-[13px] tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Right: Phone Action */}
            <div className="flex items-center md:hidden">
              <a
                href={BUSINESS.phoneHref}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#4A1624] text-[#E8A0B0] hover:bg-[#5A1C2C] active:scale-95 transition-all cursor-pointer shadow-xs"
                aria-label="Call phone shop"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        inert={!open ? true : undefined}
        className={`fixed inset-0 z-50 transition md:hidden ${open ? "visible" : "invisible"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation drawer"
          className={`absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-[#38131E] border-l border-[#4A1624] p-6 shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header with Large Transparent Logo */}
          <div className="flex items-center justify-between border-b border-[#4A1624] pb-5">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center">
              {SITE_MEDIA.logo ? (
                <img
                  src={SITE_MEDIA.logo}
                  alt={BUSINESS.name}
                  className="h-16 w-auto max-w-[220px] object-contain"
                />
              ) : (
                <span className="font-display text-lg font-black text-[#E8A0B0] uppercase">
                  {BUSINESS.shortName}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#4A1624] text-[#E8A0B0] hover:bg-[#5A1C2C] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-5 flex flex-col" aria-label="Mobile navigation">
            {ALL_NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-[50px] items-center justify-between border-b border-[#4A1624]/60 text-[15px] font-semibold text-[#D8B3BC] active:text-white"
                activeProps={{ className: "!text-[#E8A0B0] !font-bold" }}
              >
                <span>{item.label}</span>
                <ArrowRight className="h-4 w-4 text-[#C895A2]" />
              </Link>
            ))}
          </nav>

          {/* Drawer Info & Actions */}
          <div className="mt-auto grid gap-3 pt-6 border-t border-[#4A1624]">
            <div className="text-[11px] text-[#C895A2] leading-relaxed">
              <span className="font-bold text-[#E8A0B0]">16 Borough Pavement, Grange Precinct</span><br />
              <span>Mon–Sat 9:00am–5:30pm • Walk-ins welcome</span>
            </div>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#E8A0B0] hover:bg-[#F2B5C3] text-[#38131E] text-sm font-bold shadow-xs transition-colors"
            >
              Contact Us
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full border border-[#521C2A] bg-[#2A0D16] text-[#E8A0B0] text-sm font-bold transition-colors"
            >
              <Phone className="h-4 w-4" /> Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
