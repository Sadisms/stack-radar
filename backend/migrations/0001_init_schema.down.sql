-- Rollback for Stack Radar Database Schema

-- Drop archive functionality
DROP INDEX IF EXISTS idx_archive_log_archived_by;
DROP INDEX IF EXISTS idx_archive_log_archived_at;
DROP INDEX IF EXISTS idx_projects_status_updated;
DROP FUNCTION IF EXISTS get_archive_history(INTEGER);
DROP FUNCTION IF EXISTS archive_inactive_projects(INTEGER, BOOLEAN);
DROP TABLE IF EXISTS archive_log;

-- Drop triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_technologies_updated_at ON technologies;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS project_technologies CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technology_versions CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS technology_statuses CASCADE;
DROP TABLE IF EXISTS technology_categories CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
