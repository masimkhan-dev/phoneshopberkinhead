import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { ShieldCheck, CheckCircle2, XCircle, Info } from "lucide-react";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: `Warranty Policy | ${BUSINESS.name}` },
      {
        name: "description",
        content: `Learn how to confirm the repair warranty terms that apply at ${BUSINESS.name} Birkenhead.`,
      },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/warranty` }] : [],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <SiteLayout>
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 md:py-14">
        <div className="container-page max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3">
            Customer Peace of Mind
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Warranty Policy
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Confirm the current terms that apply to your repair before work begins.
          </p>
        </div>
      </div>

      <div className="container-page max-w-4xl space-y-8 py-12 text-sm md:text-base leading-relaxed text-[#555555]">
        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#AC313F]" /> Repair Warranty Terms
          </h2>
          <p>
            Warranty coverage and duration can vary by repair and replacement part. Ask{" "}
            <strong>{BUSINESS.name}</strong> to confirm the exact terms in writing before booking;
            the terms shown on your receipt or repair agreement will apply.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-6">
            <h3 className="font-bold text-[#171717] flex items-center gap-2 mb-2 text-base font-display">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" /> What Is Covered
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#555555] list-disc pl-5">
              <li>Faulty touch sensitivity or display lines caused by component defects.</li>
              <li>Faulty replacement battery performance or charging circuit components.</li>
              <li>Replacement charging ports or buttons failing under normal usage.</li>
              <li>Workmanship and installation integrity.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/5 p-6">
            <h3 className="font-bold text-[#171717] flex items-center gap-2 mb-2 text-base font-display">
              <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" /> What Is Excluded
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#555555] list-disc pl-5">
              <li>Accidental damage post-repair (e.g. drops, cracked glass, pressure damage).</li>
              <li>Water or liquid ingress occurring after repair.</li>
              <li>Third-party tampering or unauthorized repair attempts.</li>
              <li>Software modifications, jailbreaks, or virus issues.</li>
            </ul>
          </div>
        </div>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#AC313F]" /> How to Make a Warranty Claim
          </h2>
          <p>
            Bring your device back to our shop at <strong>{BUSINESS.fullAddress}</strong> with your
            receipt or proof of repair. The team will inspect the device and explain the next step
            under the terms agreed for that repair.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
