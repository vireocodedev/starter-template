-- Flyway owns schema changes. The application inherits only runtime DML through
-- this non-login role, and migration metadata remains owner-only.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vireo_runtime_dml;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO vireo_runtime_dml;
REVOKE ALL PRIVILEGES ON TABLE flyway_schema_history FROM vireo_runtime_dml;
