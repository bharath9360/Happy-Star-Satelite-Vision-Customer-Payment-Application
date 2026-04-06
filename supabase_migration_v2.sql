-- ============================================================
--  Happy Star Satellite Vision — Database Migration v2
--  Run this SQL in your Supabase SQL Editor.
--  Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- ── Add payer-tracking columns to transactions ────────────────────────────────
-- These store who MADE the payment (e.g., a family member paying for someone else).
-- Customer data in the `customers` table is NEVER modified by the payment flow.

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid_by_name  TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid_by_phone TEXT;

-- ── Index for payer phone lookups (optional, for admin reporting) ─────────────
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by_phone ON transactions(paid_by_phone);

-- ── Verification query (run after migration to confirm columns exist) ─────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'transactions'
-- ORDER BY ordinal_position;

-- ── SECURITY NOTES ────────────────────────────────────────────────────────────
-- 1. The payment API (/api/payment/verify) now NEVER writes to `customers`.
-- 2. If `name` or `village` appear in a payment request body → 403 Forbidden.
-- 3. Only the admin panel routes (protected by JWT auth) can update `customers`.
-- 4. `paid_by_name` and `paid_by_phone` in transactions are for logging only —
--    they do NOT affect the `customers` table in any way.
