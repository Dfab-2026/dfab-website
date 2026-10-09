-- DFAB Analytics schema (PostgreSQL 14+)
-- ------------------------------------------------------------
-- This file creates a separate SQL schema for website analytics.
-- The current DFAB website continues to use MongoDB at runtime.
-- Use this migration only if/when analytics are moved or mirrored
-- to PostgreSQL/Supabase in the future.
-- ------------------------------------------------------------

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS dfab_analytics;

CREATE TABLE IF NOT EXISTS dfab_analytics.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(120) NOT NULL,
    path VARCHAR(300) NOT NULL DEFAULT '/',
    page_title VARCHAR(200) NOT NULL DEFAULT 'DFAB',
    referrer TEXT NOT NULL DEFAULT '',
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_key DATE NOT NULL DEFAULT CURRENT_DATE,
    month_key VARCHAR(7) NOT NULL,
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    day SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 31)
);

CREATE TABLE IF NOT EXISTS dfab_analytics.brochure_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(120) NOT NULL DEFAULT 'anonymous',
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    source_path VARCHAR(300) NOT NULL DEFAULT '/',
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_key DATE NOT NULL DEFAULT CURRENT_DATE,
    month_key VARCHAR(7) NOT NULL,
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    day SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 31)
);

-- Keep reporting dimensions synchronized automatically from Asia/Kolkata business-time timestamps.
CREATE OR REPLACE FUNCTION dfab_analytics.set_page_view_date_parts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_key := (NEW.viewed_at AT TIME ZONE 'Asia/Kolkata')::DATE;
    NEW.month_key := TO_CHAR(NEW.viewed_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM');
    NEW.year := EXTRACT(YEAR FROM NEW.viewed_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    NEW.month := EXTRACT(MONTH FROM NEW.viewed_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    NEW.day := EXTRACT(DAY FROM NEW.viewed_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dfab_page_view_date_parts ON dfab_analytics.page_views;
CREATE TRIGGER trg_dfab_page_view_date_parts
BEFORE INSERT OR UPDATE OF viewed_at ON dfab_analytics.page_views
FOR EACH ROW EXECUTE FUNCTION dfab_analytics.set_page_view_date_parts();

CREATE OR REPLACE FUNCTION dfab_analytics.set_brochure_date_parts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_key := (NEW.downloaded_at AT TIME ZONE 'Asia/Kolkata')::DATE;
    NEW.month_key := TO_CHAR(NEW.downloaded_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM');
    NEW.year := EXTRACT(YEAR FROM NEW.downloaded_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    NEW.month := EXTRACT(MONTH FROM NEW.downloaded_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    NEW.day := EXTRACT(DAY FROM NEW.downloaded_at AT TIME ZONE 'Asia/Kolkata')::SMALLINT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dfab_brochure_date_parts ON dfab_analytics.brochure_downloads;
CREATE TRIGGER trg_dfab_brochure_date_parts
BEFORE INSERT OR UPDATE OF downloaded_at ON dfab_analytics.brochure_downloads
FOR EACH ROW EXECUTE FUNCTION dfab_analytics.set_brochure_date_parts();

CREATE INDEX IF NOT EXISTS idx_dfab_page_views_viewed_at
    ON dfab_analytics.page_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dfab_page_views_visitor
    ON dfab_analytics.page_views (visitor_id);
CREATE INDEX IF NOT EXISTS idx_dfab_page_views_path
    ON dfab_analytics.page_views (path);
CREATE INDEX IF NOT EXISTS idx_dfab_page_views_date
    ON dfab_analytics.page_views (date_key);
CREATE INDEX IF NOT EXISTS idx_dfab_page_views_month
    ON dfab_analytics.page_views (month_key);
CREATE INDEX IF NOT EXISTS idx_dfab_page_views_year_month_day
    ON dfab_analytics.page_views (year, month, day);

CREATE INDEX IF NOT EXISTS idx_dfab_brochure_downloads_downloaded_at
    ON dfab_analytics.brochure_downloads (downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dfab_brochure_downloads_email
    ON dfab_analytics.brochure_downloads (email);
CREATE INDEX IF NOT EXISTS idx_dfab_brochure_downloads_date
    ON dfab_analytics.brochure_downloads (date_key);
CREATE INDEX IF NOT EXISTS idx_dfab_brochure_downloads_month
    ON dfab_analytics.brochure_downloads (month_key);
CREATE INDEX IF NOT EXISTS idx_dfab_brochure_downloads_year_month_day
    ON dfab_analytics.brochure_downloads (year, month, day);

-- Daily page-view summary for reporting dashboards.
CREATE OR REPLACE VIEW dfab_analytics.daily_page_views AS
SELECT
    date_key,
    COUNT(*)::BIGINT AS page_views,
    COUNT(DISTINCT visitor_id)::BIGINT AS unique_visitors
FROM dfab_analytics.page_views
GROUP BY date_key
ORDER BY date_key DESC;

-- Monthly page-view summary.
CREATE OR REPLACE VIEW dfab_analytics.monthly_page_views AS
SELECT
    month_key,
    COUNT(*)::BIGINT AS page_views,
    COUNT(DISTINCT visitor_id)::BIGINT AS unique_visitors
FROM dfab_analytics.page_views
GROUP BY month_key
ORDER BY month_key DESC;

-- Yearly page-view summary.
CREATE OR REPLACE VIEW dfab_analytics.yearly_page_views AS
SELECT
    year,
    COUNT(*)::BIGINT AS page_views,
    COUNT(DISTINCT visitor_id)::BIGINT AS unique_visitors
FROM dfab_analytics.page_views
GROUP BY year
ORDER BY year DESC;

-- Brochure lead summary by day.
CREATE OR REPLACE VIEW dfab_analytics.daily_brochure_downloads AS
SELECT
    date_key,
    COUNT(*)::BIGINT AS downloads,
    COUNT(DISTINCT email)::BIGINT AS unique_leads
FROM dfab_analytics.brochure_downloads
GROUP BY date_key
ORDER BY date_key DESC;

COMMIT;
