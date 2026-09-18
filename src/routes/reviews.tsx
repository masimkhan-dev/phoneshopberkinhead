import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { PageHero } from "@/components/site/PageHero";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: `Customer Reviews | ${BUSINESS.name}` },
      { name: "description", content: `Customer feedback and reviews for ${BUSINESS.name} in Birkenhead.` },
    ],
    links: SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/reviews` }] : [],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Local Feedback"
        title="Customer Reviews &amp; Feedback"
        description="We take pride in delivering honest, dependable repairs for Birkenhead and Wirral residents. Read about our high-street counter service or leave your own review."
        actions={
          <>
            <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
              Contact the Shop <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="btn-outline min-h-11 !px-4 !text-xs font-bold !bg-white !text-[#171717] !border-[#E5E5E5] hover:!border-[#AC313F]"
            >
              <Phone className="h-3.5 w-3.5 text-[#AC313F]" /> Call {BUSINESS.phone}
            </a>
          </>
        }
      />

      <section className="section-pad bg-white">
        <div className="container-page max-w-3xl text-center py-8">
          <div className="rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-8">
            <h2 className="font-display text-xl font-bold text-[#171717]">
              Have you visited our counter at 16 Borough Pavement?
            </h2>
            <p className="mt-2 text-sm text-[#666666] leading-relaxed max-w-md mx-auto">
              Your feedback helps our independent workshop improve and assists other local residents in finding reliable repairs.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-primary min-h-11 !px-5 !text-xs font-bold">
                Get in Touch
              </Link>
              {BUSINESS.whatsapp && (
                <a
                  href={BUSINESS.whatsappMessage("Hi Phone Shop Birkenhead, I would like to leave feedback on my recent repair.")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp min-h-11 !px-4 !text-xs font-bold"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
