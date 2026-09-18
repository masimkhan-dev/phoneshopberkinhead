/** Canonical production origin — used for absolute canonicals, og:url, JSON-LD and sitemap */
// Set only after the owner confirms the production domain. An empty origin keeps
// canonical and sitemap output relative instead of publishing a guessed domain.
export const SITE_URL = process.env.VITE_SITE_URL?.replace(/\/$/, "") || "";

const PHONE_HREF = "tel:+441513450404";

export const BUSINESS = {
  // Core business identity
  name: "Phone Shop Birkenhead",
  shortName: "Phone Shop Birkenhead",
  // TODO(owner): Confirm registered legal company entity name if different from trade name
  legalName: "Phone Shop Birkenhead",
  tagline: "Sales • Accessories • Repairs",

  // Contact details
  contact: {
    phone: "+44 151 345 0404",
    phoneHref: PHONE_HREF,
    // TODO(owner): confirm WhatsApp number. Kept empty until confirmed to avoid dead/broken links.
    whatsapp: "",
    whatsappHref: "",
    whatsappMessage: (_msg: string) => PHONE_HREF,
    // TODO(owner): confirm business email address.
    email: "",
    emailHref: "",
  },

  // Address
  address: {
    line1: "16 Borough Pavement",
    line2: "Grange Precinct",
    town: "Birkenhead",
    postcode: "CH41 2XX",
    country: "United Kingdom",
    full: "16 Borough Pavement, Grange Precinct, Birkenhead, CH41 2XX, United Kingdom",
  },

  // Geographic & map location
  location: {
    // TODO(owner): confirm exact coordinates
    latitude: null as number | null,
    longitude: null as number | null,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=16+Borough+Pavement,+Grange+Precinct,+Birkenhead,+CH41+2XX,+UK",
    mapsDirections:
      "https://www.google.com/maps/dir/?api=1&destination=16+Borough+Pavement,+Grange+Precinct,+Birkenhead,+CH41+2XX,+UK",
    mapsEmbed: "",
  },

  // Web & domain identity
  website: {
    domain: process.env.VITE_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "",
    canonicalBaseUrl: SITE_URL,
  },

  // Social media presence
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },

  // Visual branding & deployment assets
  branding: {
    logo: "/site-assets/birkenhead/logo.png",
    favicon: "/site-assets/birkenhead/logo.png",
    ogImage: "/site-assets/birkenhead/logo.png",
    reviewQr: "",
    shopfront: "",
    primaryColor: "#AC313F",
  },

  // Operational schedule
  schedule: {
    display: [
      { day: "Monday – Saturday", time: "9:00 AM – 5:30 PM" },
      { day: "Sunday", time: "Closed" },
    ],
    schema: [] as Array<Record<string, unknown>>,
  },

  // Reputation & reviews
  reviews: {
    // TODO(owner): confirm Google Place / review link
    reviewUrl: "",
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Backward-compatibility getters for existing routes and dashboard components
  // ───────────────────────────────────────────────────────────────────────────
  get hours() {
    return this.schedule.display;
  },
  get openingHoursSchema() {
    return this.schedule.schema;
  },
  get phone() {
    return this.contact.phone;
  },
  get phoneHref() {
    return this.contact.phoneHref;
  },
  get whatsapp() {
    return this.contact.whatsapp;
  },
  get whatsappHref() {
    return this.contact.whatsappHref;
  },
  get whatsappMessage() {
    return this.contact.whatsappMessage;
  },
  get email() {
    return this.contact.email;
  },
  get emailHref() {
    return this.contact.emailHref;
  },
  get addressLine() {
    return `${this.address.line1}, ${this.address.line2}`;
  },
  get city() {
    return this.address.town;
  },
  get postcode() {
    return this.address.postcode;
  },
  get country() {
    return this.address.country;
  },
  get fullAddress() {
    return this.address.full;
  },
  get geo() {
    return { latitude: this.location.latitude, longitude: this.location.longitude };
  },
  get mapsDirections() {
    return this.location.mapsDirections;
  },
  get mapsEmbed() {
    return this.location.mapsEmbed;
  },
  get area() {
    return this.address.line2;
  },
  get openingHoursSummary() {
    return "Mon - Sat: 9:00 AM – 5:30 PM | Sun: Closed";
  },
  get assets() {
    return this.branding;
  },
  get reviewUrl() {
    return this.reviews.reviewUrl;
  },
};

export function getOpenStatus(now = new Date()): { isOpen: boolean; message: string } {
  if (!BUSINESS.hours.length) return { isOpen: false, message: "Call for opening hours" };
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    let weekday = "";
    let hour = 0;
    let minute = 0;

    for (const part of parts) {
      if (part.type === "weekday") weekday = part.value;
      if (part.type === "hour") hour = parseInt(part.value, 10);
      if (part.type === "minute") minute = parseInt(part.value, 10);
    }

    const currentMinutes = hour * 60 + minute;

    let openTime = 9 * 60 + 30; // 9:30 AM
    let closeTime = 18 * 60; // 6:00 PM

    if (weekday === "Saturday") {
      openTime = 9 * 60; // 9:00 AM
      closeTime = 18 * 60; // 6:00 PM
    } else if (weekday === "Sunday") {
      openTime = 9 * 60 + 30; // 9:30 AM
      closeTime = 17 * 60; // 5:00 PM
    }

    const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;
    const statusText = isOpen ? "Open today" : "Closed now";

    return { isOpen, message: statusText };
  } catch {
    return { isOpen: true, message: "Open today" };
  }
}

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export const BRANDS_WE_REPAIR = [
  "Apple",
  "Samsung",
  "Google",
  "Huawei",
  "Xiaomi",
  "Oppo",
  "OnePlus",
  "Lenovo",
  "HP",
  "Dell",
  "PlayStation",
  "Xbox",
  "Nintendo",
];

export const WHY_CHOOSE_US = [
  "Professional Repairs",
  "Quality Parts",
  "Competitive Prices",
  "Fast Service",
  "Walk-in Service",
  "Ask about collection options",
  "Ask about mail-in options",
  "Call for accessibility details",
];

export const REPAIR_PROCESS = [
  { n: "01", t: "Contact Us", d: "Call or visit the shop." },
  { n: "02", t: "Choose Your Repair", d: "Tell us the device, brand and issue." },
  { n: "03", t: "Confirm Your Service Method", d: "Ask the team which methods are available." },
  { n: "04", t: "We Repair Your Device", d: "Diagnosed and fixed by trained technicians." },
  { n: "05", t: "Get Your Device Back", d: "Agree collection or return arrangements with the team." },
];

export const FAQS = [
  {
    q: "How long does a repair take?",
    a: "Many common repairs, such as screen or battery replacements, may be completed the same day depending on the device, fault complexity and parts availability. Contact us for an accurate estimate.",
  },
  {
    q: "Do I need an appointment?",
    a: "Please call to confirm opening hours and whether an appointment is needed.",
  },
  {
    q: "Do you offer mail-in repairs?",
    a: "Please call to confirm whether mail-in repairs are currently available.",
  },
  {
    q: "Do you offer door-to-door repairs?",
    a: "Please call to ask whether collection and return are available in your area.",
  },
  {
    q: "Do you buy used phones?",
    a: "Please call to ask about buying your device and the assessment process.",
  },
  {
    q: "Do you sell refurbished phones?",
    a: "Please call to confirm current refurbished stock and condition.",
  },
  {
    q: "Do you repair gaming consoles?",
    a: "Yes — PlayStation, Xbox and Nintendo. HDMI ports, controllers, fans and more.",
  },
  {
    q: "Do repairs come with a warranty?",
    a: "Please ask the shop to confirm warranty terms for your specific repair.",
  },
];

export const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/repair-terms", label: "Repair Terms" },
  { to: "/warranty", label: "Warranty Policy" },
  { to: "/refunds", label: "Returns & Refund Policy" },
] as const;
