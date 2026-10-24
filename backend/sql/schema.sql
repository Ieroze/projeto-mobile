-- Gatos da Corte - schema inicial PostgreSQL
-- Este arquivo serve como base de alinhamento. O backend deve evoluir isto
-- para migrations (ex.: Alembic) antes de producao.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE adoption_status AS ENUM (
  'available',
  'in_process',
  'adopted',
  'not_available'
);

CREATE TYPE care_status AS ENUM (
  'healthy',
  'treatment',
  'temporary_home'
);

CREATE TYPE application_status AS ENUM (
  'submitted',
  'under_review',
  'needs_information',
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  sex VARCHAR(10) NOT NULL CHECK (sex IN ('female', 'male')),
  birth_date DATE,
  approximate_age_months INTEGER CHECK (approximate_age_months >= 0),
  short_description VARCHAR(280),
  description TEXT,
  adoption_status adoption_status NOT NULL DEFAULT 'not_available',
  care_status care_status NOT NULL DEFAULT 'healthy',
  castrated BOOLEAN NOT NULL DEFAULT FALSE,
  vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  fiv_felv_negative BOOLEAN,
  traits TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cats_public_listing
  ON cats (published, adoption_status, care_status);

CREATE TABLE cat_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(180),
  position INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cat_photos_cat ON cat_photos (cat_id, position);

CREATE TABLE cat_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  record_type VARCHAR(60) NOT NULL,
  title VARCHAR(160) NOT NULL,
  notes TEXT,
  occurred_on DATE,
  next_due_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol VARCHAR(40) NOT NULL UNIQUE,
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE RESTRICT,
  applicant_name VARCHAR(160) NOT NULL,
  applicant_email VARCHAR(255),
  applicant_phone VARCHAR(40) NOT NULL,
  city VARCHAR(120),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  status application_status NOT NULL DEFAULT 'submitted',
  internal_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_adoption_applications_cat_status
  ON adoption_applications (cat_id, status);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  goal_cents BIGINT NOT NULL CHECK (goal_cents >= 0),
  raised_cents BIGINT NOT NULL DEFAULT 0 CHECK (raised_cents >= 0),
  pix_key VARCHAR(255),
  starts_on DATE,
  ends_on DATE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE guide_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE guide_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES guide_categories(id) ON DELETE RESTRICT,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  summary VARCHAR(320),
  body TEXT NOT NULL,
  references_text TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guide_articles_public
  ON guide_articles (published, category_id, published_at DESC);
