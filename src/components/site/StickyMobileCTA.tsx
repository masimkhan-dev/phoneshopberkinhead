import { MessageCircle, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export function StickyMobileCTA() {
  return (
    <div
      role="region"
      aria-label="Quick contact actions"
      className={`fixed inset-x-0 bottom-0 z-40 grid gap-2 border-t border-[#E5E5E5] bg-white px-3 pt-2.5 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden ${BUSINESS.whatsapp ? "grid-cols-2" : "grid-cols-1"}`}
    >
      <a href={BUSINESS.phoneHref} className="btn-dark min-h-12 !rounded-lg !text-xs font-bold justify-center">
        <Phone className="h-4 w-4 text-[#AC313F]" /> Call Shop
      </a>
      {BUSINESS.whatsapp && (
        <a
          href={BUSINESS.whatsappMessage("Hi Phone Shop Birkenhead, I'd like a repair quote.")}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp min-h-12 !rounded-lg !text-xs font-bold justify-center"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      )}
    </div>
  );
}

