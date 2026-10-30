-- Lead-Cockpit, part 1: every enquiry from /api/contact is stored here before the owner e-mail goes out.
-- Conventions: ISO-8601 UTC strings written by the Worker; whole CHF as INTEGER; booleans 0/1;
-- ids from crypto.randomUUID(); migrations are additive only (never edit an applied file).

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source TEXT NOT NULL, -- kontakt-page | aquafacial-lp | aquafacial-microneedling-lp | manual
  campaign TEXT NOT NULL DEFAULT '',
  offer TEXT NOT NULL DEFAULT '',
  treatment TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  landing_page TEXT NOT NULL DEFAULT '',
  page_url TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  email TEXT,
  email_normalized TEXT,
  phone TEXT,
  phone_normalized TEXT,
  preferred_contact_method TEXT NOT NULL DEFAULT '',
  preferred_callback_time TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  skin_goal TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  fbclid TEXT NOT NULL DEFAULT '',
  gclid TEXT NOT NULL DEFAULT '',
  msclkid TEXT NOT NULL DEFAULT '',
  -- status: neu | kontaktiert | gebucht | erschienen | no_show | abgesagt | nicht_erreicht
  status TEXT NOT NULL DEFAULT 'neu',
  status_changed_at TEXT NOT NULL,
  first_contact_at TEXT,
  contact_attempts INTEGER NOT NULL DEFAULT 0,
  appointment_at TEXT,
  revenue_first_visit_chf INTEGER,
  follow_up_booked INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  marketing_consent_at TEXT,
  marketing_synced_at TEXT,
  confirmation_sent_at TEXT,
  nudge_sent_at TEXT,
  followup_sent_at TEXT,
  review_sent_at TEXT,
  unsubscribed_at TEXT,
  returning_of_lead_id TEXT,
  treatwell_booking_ref TEXT,
  exclude TEXT -- NULL | 'test' | 'spam'
);

CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email_normalized ON leads(email_normalized);
CREATE INDEX idx_leads_phone_normalized ON leads(phone_normalized);
CREATE INDEX idx_leads_utm_content ON leads(utm_content);

CREATE TABLE lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  at TEXT NOT NULL,
  type TEXT NOT NULL,
  actor TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  meta TEXT
);

CREATE INDEX idx_lead_events_lead ON lead_events(lead_id, at);
