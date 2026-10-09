# DFAB Analytics SQL Schema

`dfab_analytics_schema.sql` is an optional PostgreSQL/Supabase-compatible schema for a separate analytics data store.

The current DFAB website continues to use MongoDB collections `site_views` and `brochure_downloads`; this SQL file does **not** replace or disable that working flow.

It creates:
- `dfab_analytics.page_views`
- `dfab_analytics.brochure_downloads`
- date/month/year indexes
- daily, monthly and yearly reporting views

If analytics are later migrated to PostgreSQL/Supabase, run the SQL file in the SQL editor/migration runner and then point only the analytics backend endpoints to those tables.
