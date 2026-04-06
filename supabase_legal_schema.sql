-- ─────────────────────────────────────────────────────────────────────────────
-- Happy Star Satellite Vision — Legal & Trust Module Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Page content (privacy, terms, refund, about, security)
create table if not exists pages_content (
  id           serial primary key,
  page_name    text unique not null,
  content      text not null default '',
  last_updated timestamptz default now()
);

-- Seed with empty placeholders so admin PUT works immediately
insert into pages_content (page_name, content) values
  ('privacy',  ''),
  ('terms',    ''),
  ('refund',   ''),
  ('about',    ''),
  ('security', '')
on conflict (page_name) do nothing;

-- 2. FAQ
create table if not exists faq (
  id         serial primary key,
  question   text not null,
  answer     text not null,
  sort_order int  not null default 0
);

-- Seed with default FAQs
insert into faq (question, answer, sort_order) values
  ('How do I recharge my cable TV?', 'Enter your STB/Box Number, select your village and subscription plan, then complete payment via Razorpay.', 1),
  ('What is my STB/Box Number?', 'Your STB (Set-Top Box) number is printed on your cable box or provided by the cable operator during installation.', 2),
  ('Is my payment information secure?', 'Yes. All payments are processed by Razorpay (PCI-DSS Level 1 certified). We never store your card or bank details.', 3),
  ('What happens if my payment fails?', 'If your amount is debited but the recharge fails, it will be auto-refunded to your original payment source within 5–7 working days.', 4),
  ('Can I get a refund for a successful recharge?', 'No. Successful recharges are non-refundable. Please verify your STB number before making payment.', 5),
  ('What are the operating hours for support?', 'Our support team is available Monday to Saturday, 10 AM – 6 PM IST.', 6),
  ('How do I contact customer support?', 'Call 9751775472 or email happystar88793@gmail.com for cable queries. For website issues, call 9360294463.', 7),
  ('Do you offer multi-month plans?', 'Yes! We offer 1 Month, 6 Month, and 1 Year plans with free months on longer subscriptions.', 8)
on conflict do nothing;

-- 3. Contact info
create table if not exists contact_info (
  id            serial primary key,
  cable_phone   text default '9751775472',
  cable_email   text default 'happystar88793@gmail.com',
  website_phone text default '9360294463',
  website_email text default 'bharathkkbharath3@gmail.com',
  working_hours text default '10 AM – 6 PM'
);

-- Seed with a single row (only ever 1 row used)
insert into contact_info (cable_phone, cable_email, website_phone, website_email, working_hours)
values ('9751775472', 'happystar88793@gmail.com', '9360294463', 'bharathkkbharath3@gmail.com', '10 AM – 6 PM')
on conflict do nothing;

-- 4. Site settings (logo)
create table if not exists site_settings (
  id       serial primary key,
  logo_url text default ''
);

-- Seed with one row
insert into site_settings (logo_url) values ('')
on conflict do nothing;
