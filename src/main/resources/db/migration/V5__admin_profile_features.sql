-- Add missing columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id);

-- Add missing columns to homework_submissions table
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS reviewed_by BIGINT REFERENCES users(id);

-- Create admin_notes table
CREATE TABLE IF NOT EXISTS admin_notes (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
