import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${BUSINESS.name}` },
      {
        name: "description",
        content: `UK GDPR compliant Privacy Policy for ${BUSINESS.name}. Learn how we protect your personal data.`,
      },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/privacy` }] : [],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 md:py-14">
        <div className="container-page max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3">
            Legal &amp; Compliance
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Last Updated: January 2026 • Compliant with UK General Data Protection Regulation (UK GDPR) &amp; Data Protection Act 2018.
          </p>
        </div>
      </div>

      <div className="container-page max-w-4xl py-12">
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-[#555555]">
          <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#AC313F]" /> 1. Data Controller Information
            </h2>
            <p>
              <strong>{BUSINESS.name}</strong> ("we", "us", or "our") acts as the Data Controller
              responsible for your personal data collected via our website, walk-in repair shop at{" "}
              <strong>{BUSINESS.fullAddress}</strong>, or communication channels.
            </p>
            <p className="mt-3 text-xs text-[#666666]">
              Contact:{" "}
              <a href={BUSINESS.phoneHref} className="text-[#AC313F] font-semibold underline">
                {BUSINESS.phone}
              </a>
            </p>
          </section>

          <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#AC313F]" /> 2. Personal Data We Collect
            </h2>
            <p>
              We may collect and process the following data depending on your interaction with us:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-xs sm:text-sm text-[#555555]">
              <li>
                <strong>Contact Details:</strong> Name, phone number, email address, and delivery/collection address.
              </li>
              <li>
                <strong>Repair &amp; Device Records:</strong> Device model, serial number/IMEI, fault description, passcode (where explicitly authorized for diagnostic testing), and repair history.
              </li>
              <li>
                <strong>Transaction Data:</strong> Details of quotes, payments, invoices, and trade-in valuations.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, and essential website cookies required for navigation.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#AC313F]" /> 3. How We Use Your Data &amp; Legal Basis
            </h2>
            <p>We process your data strictly under valid legal bases under UK GDPR:</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="p-4 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5]">
                <div className="font-bold text-[#171717] text-xs uppercase tracking-wide">
                  Contractual Performance
                </div>
                <div className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                  To process repair bookings, issue quotes, process payments, and fulfill warranty claims.
                </div>
              </div>
              <div className="p-4 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5]">
                <div className="font-bold text-[#171717] text-xs uppercase tracking-wide">
                  Legitimate Interests
                </div>
                <div className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                  To maintain retail inventory, prevent fraud, and ensure shop security.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#AC313F]" /> 4. Your Rights Under UK GDPR
            </h2>
            <p>
              You have the right to request access to, correction of, or erasure of your personal
              data held by us, as well as object to processing. To exercise any of these rights,
              contact us by phone at{" "}
              <a href={BUSINESS.phoneHref} className="text-[#AC313F] font-semibold underline">
                {BUSINESS.phone}
              </a>
              .
            </p>
            <p className="mt-3 text-xs text-[#666666]">
              You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
