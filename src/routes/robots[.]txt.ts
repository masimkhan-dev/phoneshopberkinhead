import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { SITE_URL } from "@/lib/business";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL || new URL(getRequest().url).origin;
        return new Response(
          SITE_URL
            ? `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /auth\n\nSitemap: ${origin}/sitemap.xml\n`
            : "User-agent: *\nDisallow: /\n",
          { headers: { "Content-Type": "text/plain; charset=utf-8" } },
        );
      },
    },
  },
});
