import { Link } from "@tanstack/react-router";
import { Store, Truck, Send, ArrowRight, CheckCircle2 } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export function RepairMethods() {
  return (
    <section className="section-pad bg-white border-b border-slate-100">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">Flexible Repair Options</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#0F172A]">
            Discuss your repair options.
          </h2>
          <p className="mt-2 text-slate-600 text-base font-medium">
            Call to confirm which service methods are currently available.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Walk-In */}
          <div className="card-flat flex flex-col justify-between !p-8 group hover:border-[#D92D20]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#D92D20] flex items-center justify-center mb-6 group-hover:bg-[#D92D20] group-hover:text-white transition-colors">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">Walk-In Repairs</h3>
              <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                Visit our shop at 16 Borough Pavement, Grange Precinct, Birkenhead. Call ahead to confirm opening hours, repair availability and expected turnaround.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Visit during opening
                  hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Ask about device
                  assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Confirm warranty
                  terms
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={BUSINESS.mapsDirections}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-extrabold text-[#D92D20] flex items-center gap-1"
              >
                Get Directions <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-xs font-bold text-slate-500">Birkenhead shop</span>
            </div>
          </div>

          {/* Card 2: Door-to-Door */}
          <div className="card-flat flex flex-col justify-between !p-8 group hover:border-[#D92D20]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#D92D20] flex items-center justify-center mb-6 group-hover:bg-[#D92D20] group-hover:text-white transition-colors">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">Door-to-Door Collection</h3>
              <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                Call to ask whether collection and return are available for your location.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Ask about home
                  collection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Confirm current
                  availability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Agree collection
                  arrangements
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={BUSINESS.whatsappMessage(
                  "Hi Phone Shop Birkenhead, I'd like to book a Door-to-Door pickup.",
                )}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-extrabold text-[#D92D20] flex items-center gap-1"
              >
                Ask About Collection <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-xs font-bold text-slate-500">Call to confirm</span>
            </div>
          </div>

          {/* Card 3: Mail-In */}
          <div className="card-flat flex flex-col justify-between !p-8 group hover:border-[#D92D20]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#D92D20] flex items-center justify-center mb-6 group-hover:bg-[#D92D20] group-hover:text-white transition-colors">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">Mail-In Repairs</h3>
              <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                Please call before posting a device to confirm whether mail-in repairs are available and agree the terms.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Ask about UK mail-in
                  service
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Confirm
                  return-shipping terms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF493D] shrink-0" /> Request progress
                  updates
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/contact"
                className="text-xs font-extrabold text-[#D92D20] flex items-center gap-1"
              >
                Ask About Mail-In <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs font-bold text-slate-500">Call to confirm</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
