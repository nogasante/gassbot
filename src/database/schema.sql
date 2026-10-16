-- GASSBot PostgreSQL Database Schema
-- Ghana Association of Statistics Students (KNUST)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'moderator', 'executive')),
    academic_level INT CHECK (academic_level IS NULL OR academic_level IN (100, 200, 300, 400)),
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_academic_level ON users (academic_level);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    level INT NOT NULL CHECK (level IN (100, 200, 300, 400)),
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_level_semester ON courses (level, semester);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses (code);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
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
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('past_question', 'lecture_slide', 'note', 'syllabus', 'e_book', 'tutorial', 'code_repo', 'guide', 'external_link')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('curriculum', 'beyond_curriculum')),
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    topic_id INT REFERENCES topics(id) ON DELETE SET NULL,
    beyond_category VARCHAR(100),
    file_url TEXT NOT NULL,
    telegram_file_id TEXT,
    file_format VARCHAR(20) DEFAULT 'pdf',
    tags TEXT[] DEFAULT '{}',
    download_count INT NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (category);
CREATE INDEX IF NOT EXISTS idx_resources_beyond_category ON resources (beyond_category);
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources (course_id);
CREATE INDEX IF NOT EXISTS idx_resources_topic_id ON resources (topic_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources (resource_type);

-- 5. Resource Requests Table
CREATE TABLE IF NOT EXISTS resource_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(50),
    topic_title VARCHAR(255),
    details TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
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
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
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
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'event', 'academic')),
    target_level INT CHECK (target_level IS NULL OR target_level IN (100, 200, 300, 400)),
    broadcasted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_target_level ON announcements (target_level);
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
