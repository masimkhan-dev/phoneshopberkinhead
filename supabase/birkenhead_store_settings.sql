-- =============================================================================
-- PHONE SHOP BIRKENHEAD — Initial Store Settings Configuration
-- =============================================================================
-- IMPORTANT SAFETY WARNING:
-- 1. Run this script ONLY on a newly created, dedicated Birkenhead Supabase project.
-- 2. NEVER run this script against an existing Prescot production database.
-- 3. This script is idempotent and safely upserts Birkenhead's confirmed identity.
-- =============================================================================

INSERT INTO public.store_settings (key, value) VALUES
  ('business_name',              'Phone Shop Birkenhead'),
  ('address_line',               '16 Borough Pavement, Grange Precinct, Birkenhead, CH41 2XX, United Kingdom'),
  ('phone',                      '+44 151 345 0404'),
  -- TODO(owner): Update email and whatsapp once official accounts are confirmed.
  ('email',                      ''),
  ('whatsapp',                   ''),
  ('timezone',                   'Europe/London'),
  ('currency',                   'GBP'),
  -- TODO(owner): Set vat_registered to 'true' and provide vat_number / vat_rate before live invoicing
  ('vat_registered',             'false'),
  ('vat_number',                 ''),
  ('vat_rate_percent',           ''),
  -- TODO(owner): Set company_number if registered at Companies House
  ('company_number',             ''),
  -- TODO(owner): Set default repair warranty in days (e.g. '90' or '365')
  ('default_warranty_days',      ''),
  ('allow_negative_stock',       'false'),
  ('require_adj_approval',       'true'),
  ('door_to_door_charge_pence',  '0'),
  ('receipt_footer',             'Thank you for choosing Phone Shop Birkenhead!'),
  ('invoice_prefix',             'INV'),
  ('repair_prefix',              'REP'),
  ('credit_note_prefix',         'CRN'),
  ('po_prefix',                  'PO'),
  ('grn_prefix',                 'GRN'),
  ('adj_prefix',                 'ADJ')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
