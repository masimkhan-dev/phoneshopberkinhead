import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { Wrench, Database, ShieldAlert, Clock } from "lucide-react";

export const Route = createFileRoute("/repair-terms")({
  head: () => ({
    meta: [
      { title: `Repair Terms & Conditions | ${BUSINESS.name}` },
      {
        name: "description",
        content: `Specific Repair Terms & Conditions for device repairs at ${BUSINESS.name} Birkenhead.`,
      },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/repair-terms` }] : [],
  }),
  component: RepairTermsPage,
});

function RepairTermsPage() {
  return (
    <SiteLayout>
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 md:py-14">
        <div className="container-page max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3">
            Service Agreement
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Repair Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Please read these terms before submitting a device for repair at {BUSINESS.name}.
          </p>
        </div>
      </div>

      <div className="container-page max-w-4xl space-y-8 py-12 text-sm md:text-base leading-relaxed text-[#555555]">
        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#AC313F]" /> 1. Data Backup Responsibility
          </h2>
          <p>
            It is the customer's sole responsibility to back up all personal data, photos, files,
            and applications prior to handing over a device for repair. While we take every care,{" "}
            <strong>{BUSINESS.name} is not liable for any data loss</strong> that occurs during the
            diagnostic or repair process.
          </p>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#AC313F]" /> 2. Liquid &amp; Previous Damage Pre-existing Risks
          </h2>
          <p>
            Devices affected by liquid ingress or severe impact damage may suffer further component
            degradation during opening or diagnostic testing. We cannot guarantee full recovery for
            water-damaged devices.
          </p>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#AC313F]" /> 3. Collection &amp; Unclaimed Items
          </h2>
          <p>
            Repaired devices must be collected within 60 calendar days of notification of repair
            completion. Unclaimed items after 60 days may be recycled or sold to recover repair
            costs in accordance with UK property disposal guidelines.
          </p>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#AC313F]" /> 4. Diagnostics &amp; Unsuccessful Repairs
          </h2>
          <p>
            Diagnostic or specialist fees may still apply when a repair cannot be completed. Any
            charge should be explained and agreed before work begins; ask the team to confirm the
            terms for your device.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
