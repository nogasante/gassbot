-- GASSBot PostgreSQL Database Schema
-- Flexible, clean, and simple schema for GASS-KNUST

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    academic_level INT,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_academic_level ON users (academic_level);

-- 2. Courses Table (Flexible for easy admin add/edit/delete)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    level INT NOT NULL,
    semester INT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_level_semester ON courses (level, semester);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses (code);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics (course_id);

-- 4. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) DEFAULT 'document',
    category VARCHAR(50) DEFAULT 'curriculum',
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    beyond_category VARCHAR(100),
    beyond_sub_topic VARCHAR(100),
    file_url TEXT NOT NULL,
    telegram_file_id TEXT,
    file_format VARCHAR(50) DEFAULT 'pdf',
    tags TEXT[] DEFAULT '{}',
    download_count INT NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (category);
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources (course_id);

-- 5. Resource Requests Table
CREATE TABLE IF NOT EXISTS resource_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(50),
    topic_title VARCHAR(255),
    details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON resource_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON resource_requests (user_id);

-- 6. Saved Resources Table (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_resources (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_resource UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_resources_user ON saved_resources (user_id);

-- 7. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'normal',
    target_level INT,
    broadcasted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements (created_at DESC);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Beyond Curriculum Categories Table (Dynamically managed via PostgreSQL)
CREATE TABLE IF NOT EXISTS beyond_categories (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beyond_categories_key ON beyond_categories (key);
CREATE INDEX IF NOT EXISTS idx_beyond_categories_order ON beyond_categories (order_index);

-- 9B. Beyond Curriculum Sub-Topics Table (Sub-topics under core pillars)
CREATE TABLE IF NOT EXISTS beyond_sub_topics (
    id SERIAL PRIMARY KEY,
    pillar_key VARCHAR(50) NOT NULL REFERENCES beyond_categories(key) ON DELETE CASCADE ON UPDATE CASCADE,
    key VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beyond_sub_topics_pillar ON beyond_sub_topics (pillar_key);
CREATE INDEX IF NOT EXISTS idx_beyond_sub_topics_key ON beyond_sub_topics (key);
CREATE INDEX IF NOT EXISTS idx_beyond_sub_topics_order ON beyond_sub_topics (order_index);

-- Column safety migrations
ALTER TABLE resources ADD COLUMN IF NOT EXISTS beyond_sub_topic VARCHAR(100);

-- 10. Resource Types Table (Dynamically managed via PostgreSQL)
CREATE TABLE IF NOT EXISTS resource_types (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_types_key ON resource_types (key);
CREATE INDEX IF NOT EXISTS idx_resource_types_order ON resource_types (order_index);

-- 11. Application Settings Table (Dynamic system constants, brand, and links)
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

