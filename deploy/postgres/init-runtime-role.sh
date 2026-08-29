#!/usr/bin/env bash

set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_RUNTIME_USER:?POSTGRES_RUNTIME_USER is required}"
: "${POSTGRES_RUNTIME_PASSWORD:?POSTGRES_RUNTIME_PASSWORD is required}"

psql --set=ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=owner_user="$POSTGRES_USER" \
  --set=runtime_user="$POSTGRES_RUNTIME_USER" \
  --set=runtime_password="$POSTGRES_RUNTIME_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'runtime_user', :'runtime_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'runtime_user') \gexec
CREATE ROLE vireo_runtime_dml NOLOGIN;

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'runtime_user') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'runtime_user') \gexec
SELECT format('GRANT vireo_runtime_dml TO %I', :'runtime_user') \gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vireo_runtime_dml',
  :'owner_user'
) \gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO vireo_runtime_dml',
  :'owner_user'
) \gexec
SQL
