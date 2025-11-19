-- 1. Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 2. Команды разработки
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Категории технологий (языки, фреймворки, БД, инструменты и т.д.)
CREATE TABLE technology_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Справочник статусов технологий
CREATE TABLE technology_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Технологии (конкретные языки, фреймворки, инструменты)
CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES technology_categories(id) ON DELETE CASCADE,
    description TEXT,
    official_website VARCHAR(500),
    status_id INTEGER REFERENCES technology_statuses(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Версии технологий
CREATE TABLE technology_versions (
    id SERIAL PRIMARY KEY,
    technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    release_date DATE,
    is_lts BOOLEAN DEFAULT false,
    end_of_life DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(technology_id, version)
);

-- 7. Проекты
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'archived')),
    repository_url VARCHAR(500),
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Связь проектов с технологиями и их версиями
CREATE TABLE project_technologies (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
    version_id INTEGER REFERENCES technology_versions(id) ON DELETE SET NULL,
    usage_type VARCHAR(50) DEFAULT 'production' CHECK (usage_type IN ('production', 'development', 'testing')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(project_id, technology_id)
);

-- 9. Участники команд
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'developer',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_technologies_category ON technologies(category_id);
CREATE INDEX idx_technologies_status_id ON technologies(status_id);
CREATE INDEX idx_technology_versions_tech ON technology_versions(technology_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_technologies_project ON project_technologies(project_id);
CREATE INDEX idx_project_technologies_tech ON project_technologies(technology_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Trigger для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technologies_updated_at BEFORE UPDATE ON technologies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Первоначальные данные (seed)

-- Пользователи
-- Пароль для обоих: 'password'
INSERT INTO users (id, email, password_hash, full_name, is_admin)
VALUES
    (1, 'admin@local.com', '$2b$12$EIjSNn0ccelJXoonWL.HueQXO48oe6SLqPYGltxS4XkANs7kBj4va', 'Administrator', TRUE),
    (2, 'user@local.com', '$2b$12$EIjSNn0ccelJXoonWL.HueQXO48oe6SLqPYGltxS4XkANs7kBj4va', 'Regular User', FALSE);

-- Команды
INSERT INTO teams (id, name, description, lead_id)
VALUES
    (1, 'Core Platform', 'Основная платформа и инфраструктура', 2),
    (2, 'Web Frontend', 'Команда фронтенда и UI', 2),
    (3, 'Data & Analytics', 'Команда аналитики и данных', 2),
    (4, 'Internal Tools', 'Внутренние инструменты и автоматизация', 2),
    (5, 'Mobile', 'Мобильные клиенты', 2),
    (6, 'API Gateway', 'Шлюз и интеграции', 2),
    (7, 'DevOps', 'CI/CD и инфраструктура', 2),
    (8, 'Security', 'Безопасность приложения', 2),
    (9, 'QA', 'Тестирование и качество', 2),
    (10, 'Research', 'Исследование новых технологий', 2);

-- Категории технологий
INSERT INTO technology_categories (id, name, description, icon)
VALUES
    (1, 'Languages', 'Языки программирования', 'code'),
    (2, 'Frameworks', 'Веб‑фреймворки и платформы', 'layers'),
    (3, 'Databases', 'СУБД и хранилища данных', 'database'),
    (4, 'Infrastructure', 'Инфраструктура и DevOps', 'cloud'),
    (5, 'Tools', 'Инструменты разработки и тестирования', 'wrench'),
    (6, 'Messaging', 'Брокеры сообщений и очереди', 'message'),
    (7, 'Monitoring', 'Мониторинг и observability', 'activity'),
    (8, 'CI/CD', 'Системы сборки и доставки', 'repeat'),
    (9, 'Frontend', 'Фронтенд‑технологии', 'monitor'),
    (10, 'Security', 'Безопасность и аутентификация', 'shield');

-- Статусы технологий
INSERT INTO technology_statuses (id, name)
VALUES
    (1, 'stable'),
    (2, 'experimental'),
    (3, 'deprecated');

-- Технологии
INSERT INTO technologies (id, name, category_id, description, official_website, status_id)
VALUES
    (1, 'Go', 1, 'Язык программирования Go для бэкенда', 'https://go.dev', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (2, 'PostgreSQL', 3, 'Реляционная СУБД PostgreSQL', 'https://www.postgresql.org', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (3, 'Docker', 4, 'Контейнеризация приложений', 'https://www.docker.com', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (4, 'Kubernetes', 4, 'Оркестратор контейнеров', 'https://kubernetes.io', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (5, 'Redis', 3, 'In-memory key-value хранилище', 'https://redis.io', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (6, 'React', 9, 'Библиотека для построения UI', 'https://react.dev', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (7, 'Node.js', 1, 'JavaScript runtime для сервера', 'https://nodejs.org', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (8, 'RabbitMQ', 6, 'Брокер сообщений AMQP', 'https://www.rabbitmq.com', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (9, 'Grafana', 7, 'Панели мониторинга и визуализации', 'https://grafana.com', (SELECT id FROM technology_statuses WHERE name = 'stable')),
    (10, 'GitHub Actions', 8, 'CI/CD в GitHub', 'https://github.com/features/actions', (SELECT id FROM technology_statuses WHERE name = 'stable'));

-- Версии технологий
INSERT INTO technology_versions (id, technology_id, version, release_date, is_lts, end_of_life, notes)
VALUES
    (1, 1, '1.21', '2023-08-01', true, NULL, 'LTS версия Go'),
    (2, 1, '1.22', '2024-02-01', false, NULL, 'Актуальная версия Go'),
    (3, 2, '15', '2020-10-01', true, NULL, 'Стабильная версия PostgreSQL 15'),
    (4, 2, '16', '2023-09-01', false, NULL, 'Актуальная версия PostgreSQL 16'),
    (5, 3, '24.0', '2023-03-01', false, NULL, 'Современная версия Docker Engine'),
    (6, 6, '18.2', '2023-06-01', false, NULL, 'Актуальная версия React'),
    (7, 7, '20', '2023-04-01', false, NULL, 'Node.js 20'),
    (8, 5, '7.2', '2023-01-01', false, NULL, 'Redis 7.2'),
    (9, 8, '3.12', '2022-11-01', false, NULL, 'RabbitMQ 3.12'),
    (10, 9, '10.0', '2023-09-01', false, NULL, 'Grafana 10');

-- Проекты
INSERT INTO projects (id, name, description, team_id, status, repository_url, start_date)
VALUES
    (1, 'Stack Radar Backend', 'Бэкенд‑сервис для отслеживания технологий', 1, 'active', 'https://github.com/example/stack-radar-backend', '2024-01-10'),
    (2, 'Stack Radar Frontend', 'Фронтенд‑панель для визуализации стека', 2, 'active', 'https://github.com/example/stack-radar-frontend', '2024-01-20'),
    (3, 'Infra-as-Code', 'Инфраструктура проекта в виде кода', 7, 'active', 'https://github.com/example/infra-as-code', '2024-02-01'),
    (4, 'Monitoring Setup', 'Система мониторинга и алёртов', 7, 'maintenance', 'https://github.com/example/monitoring', '2023-11-15'),
    (5, 'API Gateway', 'Шлюз API для всех сервисов', 6, 'active', 'https://github.com/example/api-gateway', '2024-03-05'),
    (6, 'Internal Tools', 'Набор внутренних инструментов', 4, 'active', 'https://github.com/example/internal-tools', '2023-09-01'),
    (7, 'Mobile Client', 'Мобильное приложение для Stack Radar', 5, 'active', 'https://github.com/example/mobile-client', '2024-04-01'),
    (8, 'Security Hardening', 'Усиление безопасности приложений', 8, 'active', 'https://github.com/example/security', '2023-12-01'),
    (9, 'QA Automation', 'Автоматизация тестирования', 9, 'active', 'https://github.com/example/qa-automation', '2024-02-15'),
    (10, 'Tech Research', 'Исследование новых технологий', 10, 'active', 'https://github.com/example/tech-research', '2024-03-20');

-- Технологии в проектах
INSERT INTO project_technologies (id, project_id, technology_id, version_id, usage_type, notes)
VALUES
    (1, 1, 1, 2, 'production', 'Бэкенд написан на Go'),
    (2, 1, 2, 4, 'production', 'Основная база данных PostgreSQL'),
    (3, 1, 3, 5, 'production', 'Контейнеризация сервисов'),
    (4, 2, 6, 6, 'production', 'Фронтенд на React'),
    (5, 2, 7, 7, 'development', 'Node.js для сборки фронтенда'),
    (6, 3, 4, NULL, 'production', 'Kubernetes для оркестрации'),
    (7, 3, 3, 5, 'production', 'Docker для контейнеров'),
    (8, 4, 9, 10, 'production', 'Grafana для мониторинга'),
    (9, 5, 8, 9, 'production', 'RabbitMQ как брокер сообщений'),
    (10, 6, 5, 8, 'development', 'Redis для кеширования');

-- Участники команд
INSERT INTO team_members (id, team_id, user_id, role, joined_at)
VALUES
    (1, 1, 2, 'Team Lead', '2024-01-01'),
    (2, 2, 2, 'Backend Developer', '2024-01-15'),
    (3, 3, 2, 'Frontend Developer', '2024-01-20'),
    (4, 4, 2, 'Frontend Developer', '2024-01-25'),
    (5, 5, 2, 'Data Engineer', '2024-02-01'),
    (6, 6, 2, 'Tools Engineer', '2024-02-10'),
    (7, 7, 2, 'Mobile Developer', '2024-03-01'),
    (8, 8, 2, 'DevOps Engineer', '2024-02-15'),
    (9, 9, 2, 'Security Engineer', '2024-02-20'),
    (10, 10, 2, 'QA Engineer', '2024-03-05');

-- Синхронизация последовательностей SERIAL с максимальными значениями id
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('teams', 'id'), (SELECT MAX(id) FROM teams));
SELECT setval(pg_get_serial_sequence('technology_categories', 'id'), (SELECT MAX(id) FROM technology_categories));
SELECT setval(pg_get_serial_sequence('technologies', 'id'), (SELECT MAX(id) FROM technologies));
SELECT setval(pg_get_serial_sequence('technology_statuses', 'id'), (SELECT MAX(id) FROM technology_statuses));
SELECT setval(pg_get_serial_sequence('technology_versions', 'id'), (SELECT MAX(id) FROM technology_versions));
SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects));
SELECT setval(pg_get_serial_sequence('project_technologies', 'id'), (SELECT MAX(id) FROM project_technologies));
SELECT setval(pg_get_serial_sequence('team_members', 'id'), (SELECT MAX(id) FROM team_members));

-- =====================================================
-- ARCHIVE FUNCTIONALITY (Part of initial development)
-- =====================================================

-- Archive log table for tracking archiving operations
CREATE TABLE archive_log (
    id SERIAL PRIMARY KEY,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_by INTEGER REFERENCES users(id),
    projects_archived INTEGER NOT NULL,
    inactive_days_threshold INTEGER NOT NULL,
    project_ids INTEGER[] NOT NULL,
    notes TEXT,
    CONSTRAINT positive_projects CHECK (projects_archived >= 0),
    CONSTRAINT positive_threshold CHECK (inactive_days_threshold >= 0)
);

-- Stored procedure for archiving inactive projects
CREATE OR REPLACE FUNCTION archive_inactive_projects(
    inactive_days INTEGER DEFAULT 180,
    dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    project_id INTEGER,
    project_name VARCHAR,
    last_updated TIMESTAMP,
    days_inactive INTEGER,
    action_taken TEXT
) AS $$
DECLARE
    archived_count INTEGER := 0;
    project_ids_array INTEGER[];
BEGIN
    IF dry_run THEN
        -- Preview mode: just show what would be archived without making changes
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.updated_at,
            EXTRACT(DAY FROM NOW() - p.updated_at)::INTEGER as days_inactive,
            'Would archive (DRY RUN)'::TEXT as action
        FROM projects p
        WHERE p.status = 'active'
          AND p.updated_at < NOW() - (inactive_days || ' days')::INTERVAL
        ORDER BY p.updated_at ASC;
    ELSE
        -- Real archiving mode: actually update projects
        
        -- First, collect IDs of projects to be archived for logging
        SELECT ARRAY_AGG(id) INTO project_ids_array
        FROM projects
        WHERE status = 'active'
          AND updated_at < NOW() - (inactive_days || ' days')::INTERVAL;
        
        -- If no projects to archive, return early
        IF project_ids_array IS NULL THEN
            RETURN;
        END IF;
        
        -- Update projects to archived status
        UPDATE projects p
        SET status = 'archived', 
            updated_at = NOW()
        WHERE p.status = 'active'
          AND p.updated_at < NOW() - (inactive_days || ' days')::INTERVAL;
        
        -- Get count of affected rows
        GET DIAGNOSTICS archived_count = ROW_COUNT;
        
        -- Log the archiving operation (archived_by will be set by backend)
        INSERT INTO archive_log (
            projects_archived, 
            inactive_days_threshold, 
            project_ids,
            notes
        )
        VALUES (
            archived_count,
            inactive_days,
            project_ids_array,
            'Automated archiving of ' || archived_count || ' inactive project(s)'
        );
        
        -- Return archived projects
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.updated_at,
            EXTRACT(DAY FROM NOW() - p.updated_at)::INTEGER as days_inactive,
            'Archived successfully'::TEXT as action
        FROM projects p
        WHERE p.id = ANY(project_ids_array)
        ORDER BY p.updated_at ASC;
        
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper function to view archive history
CREATE OR REPLACE FUNCTION get_archive_history(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id INTEGER,
    archived_at TIMESTAMP,
    archived_by_name VARCHAR,
    projects_count INTEGER,
    inactive_threshold INTEGER,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.archived_at,
        COALESCE(u.full_name, 'System')::VARCHAR as archived_by_name,
        al.projects_archived,
        al.inactive_days_threshold,
        al.notes
    FROM archive_log al
    LEFT JOIN users u ON al.archived_by = u.id
    ORDER BY al.archived_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Performance indexes for archiving
CREATE INDEX idx_projects_status_updated ON projects(status, updated_at);
CREATE INDEX idx_archive_log_archived_at ON archive_log(archived_at DESC);
CREATE INDEX idx_archive_log_archived_by ON archive_log(archived_by);

-- Comments for documentation
COMMENT ON TABLE archive_log IS 'Audit log of all project archiving operations';
COMMENT ON FUNCTION archive_inactive_projects IS 'Archives projects inactive for specified days. Supports dry-run preview mode.';
COMMENT ON FUNCTION get_archive_history IS 'Returns recent archiving operations with user details';

-- =====================================================
-- TEST DATA: Projects for Archive Testing
-- =====================================================

-- Insert old inactive projects (will be eligible for archiving after 3 minutes)
-- These projects have updated_at set to 181 days ago plus 3 minutes from NOW
INSERT INTO projects (name, description, team_id, status, repository_url, start_date, created_at, updated_at) VALUES
    ('Legacy API v1', 'Old REST API that needs archiving - wait 3 min after startup', 1, 'active', 'https://github.com/company/legacy-api-v1', '2023-01-15', NOW() - INTERVAL '181 days', NOW() - INTERVAL '181 days' + INTERVAL '3 minutes'),
    ('Prototype Dashboard', 'Experimental dashboard prototype - wait 3 min after startup', 2, 'active', 'https://github.com/company/proto-dash', '2023-02-20', NOW() - INTERVAL '200 days', NOW() - INTERVAL '200 days' + INTERVAL '3 minutes'),
    ('Old Mobile App', 'Deprecated mobile application - wait 3 min after startup', 1, 'active', 'https://github.com/company/old-mobile', '2023-03-10', NOW() - INTERVAL '250 days', NOW() - INTERVAL '250 days' + INTERVAL '3 minutes');

-- Update the sequences for new projects
SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects));
SELECT setval(pg_get_serial_sequence('archive_log', 'id'), 1, false);

COMMENT ON TABLE projects IS 'Project records - includes 3 test projects for archive demonstration (archivable 3 minutes after system startup)';
