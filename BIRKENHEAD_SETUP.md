# Birkenhead environment setup

This code is prepared for a separate Phone Shop Birkenhead deployment. It has
not been connected to a Supabase project or initialized with production data.

1. Create a new Supabase project for Birkenhead. Replace the placeholder in
   `supabase/config.toml` with its project ID. Never link or migrate against the
   existing Prescot production project.
2. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` in the server deployment. The service role key
   stays server-only. Do not put any Supabase secret under a `VITE_` name.
3. Apply the existing migrations only to the new, empty project after review.
   Migration `20260803_004_default_settings.sql` contains the historical schema
   and seeds baseline rows. Immediately after applying migrations to the new project,
   execute `supabase/birkenhead_store_settings.sql` via the Supabase SQL editor
   to initialize `store_settings` with the confirmed Birkenhead business name,
   address, phone, and receipt footer. Leave unconfirmed email and WhatsApp blank.
   Review warranty templates and legal wording with the owner before live use.
   Do not reset document sequences on a live shop.
4. Set `VITE_SITE_URL` to the confirmed HTTPS production origin. Until it is
   set, pages emit `noindex` and `robots.txt` disallows crawling. Configure
   Supabase Auth site URL and allowed redirects for the separate domain.
5. Add owner-supplied assets under `public/site-assets/birkenhead/`, then set
   their paths in `src/lib/business.ts`. Confirm hours, coordinates, the
   official Google review link, social accounts and legal text before launch.
6. Test roles, repair intake, POS, refunds, stock, supplier purchasing, phone
   buy/sell, shifts, daily closing, reports and every printed document against
   *test data in the Birkenhead project* before production transactions.

`src/lib/business.ts` is the single source of truth for deployment identity,
canonical URL, and static assets. `store_settings` remains the admin-editable
source for printed business contact details, VAT and operational settings.
`resolveShopIdentity` intercepts and sanitizes any historical Prescot seed data,
ensuring that old Prescot details never appear on Birkenhead print outputs,
receipts, or settings forms even before the new database is initialized.

The public product catalogue is currently a curated example list, not live stock.
The decision between (A) a curated marketing catalogue and (B) a live inventory
catalogue will be made in a subsequent phase.
