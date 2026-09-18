import { BUSINESS } from "@/lib/business";

export const SITE_MEDIA = {
  logo: BUSINESS.assets.logo,
  hero: {
    src: "/site-assets/birkenhead/shopfront-hero.webp",
    alt: "Phone Shop Birkenhead high-street store and repair counter at 16 Borough Pavement, Grange Precinct",
    needsAuthenticBusinessPhoto: false,
  },
  repairHero: {
    src: "/site-assets/birkenhead/shopfront-hero.webp",
    alt: "Phone Shop Birkenhead high-street store and repair counter at 16 Borough Pavement, Grange Precinct",
    width: 591,
    height: 375,
  },
  productsBanner: {
    src: "/site-assets/product-phone.jpg",
    alt: "Illustrative selection of smartphones, foldable phone, earbuds, headphones, smartwatch and mobile accessories.",
    width: 2172,
    height: 724,
  },
  shopfront: {
    src: "/site-assets/birkenhead/shopfront-hero.webp",
    alt: "Phone Shop Birkenhead storefront and counter at 16 Borough Pavement, Grange Precinct",
    caption: "Express walk-in repairs and tech support at 16 Borough Pavement, Birkenhead",
    width: 591,
    height: 375,
  },
  products: {
    phone: "/site-assets/product-phone.jpg",
    laptop: "/site-assets/product-laptop.jpg",
    console: "/site-assets/product-console.jpg",
    accessories: "/site-assets/product-accessories.jpg",
  },
} as const;

export const GOOGLE_PROOF = {
  rating: "",
  reviewCount: 0,
  reviewsUrl: BUSINESS.reviewUrl,
  reviews: [] as {name: string; quote: string}[],
} as const;
