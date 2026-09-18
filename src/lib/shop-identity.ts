import { BUSINESS } from "@/lib/business";
import type { StoreSettings } from "@/lib/settings.functions";

// Historical seed settings belong to the source shop. A newly provisioned
// Birkenhead database must be initialized separately; until then, do not print
// those seed values on Birkenhead documents or receipts.
const isSourceShopSeed = (settings?: Partial<StoreSettings>) => {
  if (!settings) return false;
  return (
    /prescot/i.test(settings.business_name || "") ||
    /prescot|eccleston/i.test(settings.address_line || "") ||
    /7479\s*385163/.test(settings.phone || "") ||
    /precot|prescot/i.test(settings.email || "") ||
    /prescot/i.test(settings.receipt_footer || "")
  );
};

export function resolveShopIdentity(settings?: Partial<StoreSettings>) {
  const current = isSourceShopSeed(settings) ? undefined : settings;
  const rawFooter = current?.receipt_footer || "";
  const sanitizedFooter =
    rawFooter && !/prescot/i.test(rawFooter)
      ? rawFooter
      : `Thank you for choosing ${BUSINESS.name}!`;

  return {
    name: current?.business_name || BUSINESS.name,
    address: current?.address_line || BUSINESS.fullAddress,
    phone: current?.phone || BUSINESS.phone,
    email: current?.email || BUSINESS.email,
    whatsapp: current?.whatsapp || BUSINESS.whatsapp,
    footer: sanitizedFooter,
  };
}
