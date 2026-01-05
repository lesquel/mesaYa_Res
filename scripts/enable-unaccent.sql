-- Enable the unaccent extension for accent-insensitive text search
-- This allows searches like "mediterranea" to match "mediterránea"
-- Run this script once on your PostgreSQL database

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Verify the extension is installed
SELECT * FROM pg_extension WHERE extname = 'unaccent';
