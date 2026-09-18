import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Smartphone,
  Laptop,
  Gamepad2,
  Headphones,
  Cpu,
  MessageCircle,
  ShieldCheck,
  HardDrive,
  BatteryCharging,
  ArrowRight,
  Phone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "In-Store Phones, Tech & Accessories | Phone Shop Birkenhead" },
      {
        name: "description",
        content:
          "Browse refurbished smartphones, laptops, gaming consoles and mobile accessories available at Phone Shop Birkenhead, 16 Borough Pavement. Call to check live stock.",
      },
      { property: "og:title", content: "Phones, Tech & Accessories in Birkenhead | Phone Shop Birkenhead" },
      {
        property: "og:description",
        content:
          "Explore tested pre-owned smartphones, consoles, laptops and tech accessories at 16 Borough Pavement, Birkenhead.",
      },
      { property: "og:type", content: "website" },
      ...(SITE_URL ? [{ property: "og:url", content: `${SITE_URL}/products` }] : []),
      ...(BUSINESS.assets.ogImage ? [{ property: "og:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(BUSINESS.assets.ogImage ? [{ name: "twitter:image", content: `${SITE_URL}${BUSINESS.assets.ogImage}` }] : []),
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/products` }] : [],
  }),
  component: ProductsPage,
});

type Cat = "All" | "Mobile Phones" | "Laptops & Computers" | "Gaming Consoles" | "Accessories";

const categoryImage: Record<Exclude<Cat, "All">, { url: string; alt: string }> = {
  "Mobile Phones": { url: "/site-assets/product-phone.jpg", alt: "Smartphone stock" },
  "Laptops & Computers": { url: "/site-assets/product-laptop.jpg", alt: "Laptop stock" },
  "Gaming Consoles": { url: "/site-assets/product-console.jpg", alt: "Gaming console stock" },
  Accessories: { url: "/site-assets/product-accessories.jpg", alt: "Accessories stock" },
};

const catalog: {
  name: string;
  category: Exclude<Cat, "All">;
  status: "Brand New" | "Grade A Refurbished" | "Certified Pre-Owned";
  storage: string;
  battery: string;
  price: string;
}[] = [
  {
    name: "iPhone 15 Pro",
    category: "Mobile Phones",
    status: "Grade A Refurbished",
    storage: "256GB Storage",
    battery: "100% Battery Health",
    price: "Call for price",
  },
  {
    name: "iPhone 13",
    category: "Mobile Phones",
    status: "Certified Pre-Owned",
    storage: "128GB Storage",
    battery: "90%+ Battery Health",
    price: "Call for price",
  },
  {
    name: "Samsung Galaxy S24",
    category: "Mobile Phones",
    status: "Brand New",
    storage: "256GB Storage",
    battery: "Factory Sealed",
    price: "Call for price",
  },
  {
    name: "Google Pixel 8",
    category: "Mobile Phones",
    status: "Certified Pre-Owned",
    storage: "128GB Storage",
    battery: "Tested Battery Health",
    price: "Call for price",
  },
  {
    name: "MacBook Air M2",
    category: "Laptops & Computers",
    status: "Grade A Refurbished",
    storage: "256GB SSD · 8GB RAM",
    battery: "Tested Battery Condition",
    price: "Call for price",
  },
  {
    name: "Dell XPS 13",
    category: "Laptops & Computers",
    status: "Certified Pre-Owned",
    storage: "512GB SSD · 16GB RAM",
    battery: "Tested & Health Verified",
    price: "Call for price",
  },
  {
    name: "PlayStation 5 Slim",
    category: "Gaming Consoles",
    status: "Brand New",
    storage: "1TB Ultra-SSD",
    battery: "UK Disc Edition",
    price: "Call for price",
  },
  {
    name: "Xbox Series X",
    category: "Gaming Consoles",
    status: "Certified Pre-Owned",
    storage: "1TB SSD Storage",
    battery: "Includes Controller",
    price: "Call for price",
  },
  {
    name: "Nintendo Switch OLED",
    category: "Gaming Consoles",
    status: "Grade A Refurbished",
    storage: "64GB + MicroSD Slot",
    battery: "Tested & Cleaned",
    price: "Call for price",
  },
  {
    name: "Fast Charger 65W Duo",
    category: "Accessories",
    status: "Brand New",
    storage: "Dual USB-C Ports",
    battery: "Power Delivery 3.0",
    price: "In Store Stock",
  },
];

const CATS: Cat[] = [
  "All",
  "Mobile Phones",
  "Laptops & Computers",
  "Gaming Consoles",
  "Accessories",
];

function ProductsPage() {
  const [active, setActive] = useState<Cat>("All");
  const filtered = active === "All" ? catalog : catalog.filter((p) => p.category === active);

  return (
    <SiteLayout>
      {/* Compact Internal Hero */}
      <PageHero
        eyebrow="In-Store Catalogue • Birkenhead"
        title="Phones, Tech &amp; Everyday Accessories"
        description="Browse pre-owned smartphones, laptops, consoles, and essential high-street accessories available at 16 Borough Pavement. All pre-owned hardware is thoroughly tested before sale."
        actions={
          <>
            <a href={BUSINESS.phoneHref} className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              <Phone className="h-3.5 w-3.5" /> Call to Check Stock: {BUSINESS.phone}
            </a>
            {BUSINESS.whatsapp && (
              <a
                href={BUSINESS.whatsappMessage("Hi Phone Shop Birkenhead, I would like to check current device availability.")}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp min-h-11 !px-4 !text-xs font-bold"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Shop
              </a>
            )}
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#555555]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Walk-In Counter Availability
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Store Warranty on Handsets
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#AC313F]" /> Network Unlocked
            </span>
          </div>
        }
      />

      {/* Product Category Filter & Catalogue Grid */}
      <section className="section-pad bg-white" id="catalogue">
        <div className="container-page">
          {/* Filter Rail */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  aria-pressed={active === c}
                  className={`min-h-10 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    active === c
                      ? "bg-[#AC313F] text-white shadow-xs"
                      : "border border-[#E5E5E5] bg-[#F7F7F7] text-[#171717] hover:border-[#AC313F]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#666666]">
              Showing {filtered.length} {filtered.length === 1 ? "device" : "devices & accessories"}
            </span>
          </div>

          {/* Product Cards Grid */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.name}
                className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-5 hover:border-[#AC313F] transition-all"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-white border border-[#E5E5E5] mb-4">
                    <img
                      src={categoryImage[p.category].url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-[#171717]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {p.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-[#AC313F]">
                    {p.category}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#171717]">{p.name}</h3>

                  <div className="mt-3 space-y-1 text-xs font-medium text-[#555555]">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-[#666666]" />
                      <span>{p.storage}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BatteryCharging className="h-3.5 w-3.5 text-[#666666]" />
                      <span>{p.battery}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#171717] uppercase">
                    {p.price}
                  </span>
                  <a
                    href={BUSINESS.phoneHref}
                    className="btn-outline !h-9 !px-3 !text-xs font-bold !bg-white hover:!border-[#AC313F]"
                  >
                    Check Stock
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-4 sm:p-5 text-xs text-[#666666] leading-relaxed">
            <strong className="text-[#171717]">Looking for a specific model or storage size?</strong> Pre-owned stock updates frequently throughout the week. If you do not see the handset you need, call{" "}
            <a href={BUSINESS.phoneHref} className="font-bold text-[#AC313F] underline">
              {BUSINESS.phone}
            </a>{" "}
            or visit 16 Borough Pavement to check current counter arrivals.
          </div>
        </div>
      </section>

      {/* Bottom Visit Banner */}
      <section className="py-14 bg-[#171717] text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Visit our Birkenhead shop today
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              Browse accessories, test pre-owned phones in your hands, or ask our team for advice at 16 Borough Pavement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={BUSINESS.phoneHref} className="btn-primary min-h-12 !px-6 !text-xs font-bold">
              Call Counter: {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
