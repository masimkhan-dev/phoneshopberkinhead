import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { RefreshCw, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: `Returns & Refund Policy | ${BUSINESS.name}` },
      {
        name: "description",
        content: `Returns & Refund Policy compliant with UK Consumer Rights Act 2015 for ${BUSINESS.name}.`,
      },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/refunds` }] : [],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <SiteLayout>
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 md:py-14">
        <div className="container-page max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3">
            Consumer Guarantees
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Returns &amp; Refund Policy
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Compliant with the UK Consumer Rights Act 2015 and Consumer Contracts Regulations.
          </p>
        </div>
      </div>

      <div className="container-page max-w-4xl py-12 space-y-8 text-sm md:text-base leading-relaxed text-[#555555]">
        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#AC313F]" /> 1. Retail Device &amp; Accessory Sales Returns
          </h2>
          <p>For pre-owned, refurbished devices, or accessories purchased in-store or online:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1.5 text-xs sm:text-sm text-[#555555]">
            <li>
              <strong>14-Day Return Window:</strong> You may return unused accessories or eligible
              pre-owned devices within 14 days in original condition with proof of purchase.
            </li>
            <li>
              <strong>Faulty Items:</strong> Under the UK Consumer Rights Act 2015, if a product
              develops a hardware fault within 30 days, you are entitled to an immediate refund,
              repair, or replacement.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#171717] mb-3 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#AC313F]" /> 2. Repair Service Refunds
          </h2>
          <p>
            Labour and custom component orders for completed repairs are generally non-refundable
            once installed and verified working. If a replacement component remains defective,
            contact the team so it can be assessed under the warranty terms agreed for that repair
            and your statutory rights.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
