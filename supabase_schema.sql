-- ============================================================
--  Happy Star Satellite Vision - Supabase Database Schema
--  Run this SQL in your Supabase SQL Editor (once).
-- ============================================================

-- 1. Admin table
CREATE TABLE IF NOT EXISTS admin (
  id       SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL  -- bcrypt hash
);

-- 2. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id               SERIAL PRIMARY KEY,
  stb_number       TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  mobile           TEXT NOT NULL,
  village          TEXT NOT NULL,
  street           TEXT,
  has_amplifier    BOOLEAN DEFAULT FALSE,
  alternate_mobile TEXT,
  full_address     TEXT,
  status           TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive'))
);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id               SERIAL PRIMARY KEY,
  stb_number       TEXT NOT NULL REFERENCES customers(stb_number) ON UPDATE CASCADE,
  amount_paid      NUMERIC(10,2) NOT NULL,
  months_recharged INTEGER NOT NULL,
  payment_id       TEXT,
  payment_status   TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'success', 'failed')),
  date             TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes for performance ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_village    ON customers(village);
CREATE INDEX IF NOT EXISTS idx_customers_status     ON customers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_stb     ON transactions(stb_number);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_status  ON transactions(payment_status);

-- ─── Row Level Security (Enable in Supabase dashboard too) ──
-- Using service-role key in backend so RLS won't block server calls.
-- You may enable RLS and add policies if needed for extra security.

-- ─── Seed default admin (password: admin@123) ───────────────
-- NOTE: Run the /api/auth/seed-admin endpoint instead, which
-- uses bcrypt. This is just the structure reference.
-- INSERT INTO admin (username, password)
-- VALUES ('admin', '<bcrypt_hash_of_admin@123>');

-- ─── Sample customer (for testing) ──────────────────────────
-- INSERT INTO customers (stb_number, name, mobile, village, street, status)
-- VALUES ('STB001', 'Test User', '9876543210', 'Chennai', 'Anna Nagar', 'active');

-- 4. App Settings table (used by Admin Settings page)
--    Stores key-value JSON pairs for dynamic configuration.
CREATE TABLE IF NOT EXISTS app_settings (
  id         SERIAL PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,   -- e.g. 'payment_form'
  value      JSONB NOT NULL,         -- the full config document
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_app_settings_timestamp();

