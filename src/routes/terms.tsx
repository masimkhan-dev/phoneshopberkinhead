import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${BUSINESS.name}` },
      {
        name: "description",
        content: `Terms & Conditions for using ${BUSINESS.name} website and services in Birkenhead, Merseyside.`,
      },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/terms` }] : [],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 md:py-14">
        <div className="container-page max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3">
            Legal &amp; Compliance
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Effective Date: January 2026 • Governing website usage and retail inquiries for {BUSINESS.name}.
          </p>
        </div>
      </div>

      <div className="container-page max-w-4xl py-12 space-y-8 text-sm md:text-base leading-relaxed text-[#555555]">
        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#AC313F]" /> 1. Agreement to Terms
          </h2>
          <p>
            By accessing or using our website, requesting repair estimates, or visiting our premises
            at <strong>{BUSINESS.fullAddress}</strong>, you agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#AC313F]" /> 2. Estimates &amp; Pricing Disclaimer
          </h2>
          <p>
            Online quote calculators and instant price checkers provide{" "}
            <strong>estimates only</strong> based on information provided by the user. Final repair
            pricing is confirmed after manual physical inspection by our technicians in store.
          </p>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#AC313F]" /> 3. Governing Law
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of England and
            Wales. Any disputes arising shall be subject to the exclusive jurisdiction of the courts
            of England and Wales.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
