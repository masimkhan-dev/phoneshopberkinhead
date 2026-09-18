import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ShieldCheck,
  Star,
  MapPin,
  ArrowRight,
  Zap,
} from "lucide-react";
import { REPAIR_PROCESS, WHY_CHOOSE_US, BRANDS_WE_REPAIR, FAQS } from "@/lib/business";

export function TrustBar() {
  return (
    <section className="py-8 bg-white border-y border-[#E5E5E5]">
      <div className="container-page">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Local Reputation */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 transition-all hover:border-[#AC313F] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#171717] flex items-center gap-1.5 font-display">
                Recommended{" "}
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  Local
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717]">Local Birkenhead Reviews</div>
              <p className="mt-0.5 text-xs text-[#666666]">Trusted by local customers</p>
            </div>
          </div>

          {/* Card 2: Warranty */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 transition-all hover:border-[#AC313F] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#171717] font-display">
                Store Warranty{" "}
                <span className="text-[10px] font-bold text-[#AC313F] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">
                  Included
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717]">
                Parts &amp; Workmanship
              </div>
              <p className="mt-0.5 text-xs text-[#666666]">Tested replacement parts fitted</p>
            </div>
          </div>

          {/* Card 3: Same-Day Repairs */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 transition-all hover:border-[#AC313F] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#171717] font-display">
                Express Service{" "}
                <span className="text-[10px] font-bold text-[#AC313F] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">
                  Fast
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717]">
                Same-Day Available
              </div>
              <p className="mt-0.5 text-xs text-[#666666]">On many common screen &amp; battery fixes</p>
            </div>
          </div>

          {/* Card 4: Local Shop */}
          <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5 transition-all hover:border-[#AC313F] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#AC313F] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#AC313F]" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#171717] font-display">
                High-Street Shop{" "}
                <span className="text-[10px] font-bold text-white bg-[#171717] px-2 py-0.5 rounded">
                  Birkenhead
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-[#171717]">16 Borough Pavement</div>
              <p className="mt-0.5 text-xs text-[#666666]">Opposite Grange Precinct</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RepairProcess() {
  return (
    <section className="section-pad bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">How It Works</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717]">
            Simple &amp; Transparent 3-Step Process
          </h2>
          <p className="mt-3 text-[#666666] text-base leading-relaxed">
            No unexpected fees. Clear pricing before work begins, and express completion.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Tell Us the Problem",
              desc: "Bring your phone, laptop, or console to our Birkenhead counter, or get an instant quote online.",
            },
            {
              step: "02",
              title: "Transparent Quote",
              desc: "We diagnose the fault and give you a fixed price before starting. No hidden surprises.",
            },
            {
              step: "03",
              title: "Express Repair & Collect",
              desc: "Our technicians repair and thoroughly test your device with warranty. Ready for pickup fast.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-[#E5E5E5] p-8 bg-[#F7F7F7] flex flex-col justify-between hover:border-[#AC313F] transition-all hover:shadow-md"
            >
              <div>
                <span className="text-xs font-black tracking-widest text-white bg-[#171717] px-3 py-1.5 rounded-md">
                  STEP {s.step}
                </span>
                <h3 className="mt-6 text-xl font-bold text-[#171717]">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#666666]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="section-pad bg-[#F7F7F7] border-y border-[#E5E5E5]">
      <div className="container-page">
        <div className="max-w-2xl">
          <span className="eyebrow">Why Choose Us</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717]">
            Why Customers Trust Phone Shop Birkenhead
          </h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {WHY_CHOOSE_US.map((w) => (
            <div
              key={w}
              className="flex items-start gap-3 rounded-xl bg-white border border-[#E5E5E5] p-5 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 text-[#AC313F] mt-0.5 shrink-0" />
              <span className="text-sm font-bold text-[#171717] leading-snug">{w}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandsWeRepair() {
  return (
    <section className="section-pad bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Supported Brands</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717]">
            We Repair All Major Brands &amp; Models
          </h2>
          <p className="mt-3 text-[#666666] text-base leading-relaxed">
            From the latest iPhones and Galaxy handsets to MacBooks, Dell laptops, and PlayStation consoles.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {BRANDS_WE_REPAIR.map((b) => (
            <span
              key={b}
              className="px-5 py-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-sm font-bold text-[#171717] hover:border-[#AC313F] hover:text-[#AC313F] transition-all"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WarrantyBanner() {
  return (
    <section className="py-10 bg-[#171717] text-white">
      <div className="container-page">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#AC313F] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">Quality Parts &amp; Workmanship Guaranteed</div>
              <p className="text-sm text-white/80">
                All repairs are carried out by trained technicians with full post-repair testing.
              </p>
            </div>
          </div>
          <Link to="/contact" className="btn-primary shrink-0">
            Get Free Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FAQSection({ items = FAQS }: { items?: typeof FAQS }) {
  return (
    <section className="section-pad bg-[#F7F7F7]">
      <div className="container-page">
        <div className="max-w-2xl">
          <span className="eyebrow">FAQs</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#171717]">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {items.map((f) => (
            <div key={f.q} className="rounded-2xl bg-white border border-[#E5E5E5] p-6 shadow-xs">
              <h3 className="font-bold text-[#171717] text-base">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
