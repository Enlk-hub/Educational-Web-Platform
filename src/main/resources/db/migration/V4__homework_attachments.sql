ALTER TABLE homework_submissions ALTER COLUMN content DROP NOT NULL;

CREATE TABLE homework_attachments (
  id serial PRIMARY KEY,
  homework_id integer REFERENCES homework(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  content_type text,
  size bigint,
  uploaded_at timestamp DEFAULT now()
);

CREATE INDEX idx_homework_attachments_homework_id ON homework_attachments(homework_id);

CREATE TABLE homework_submission_attachments (
  id serial PRIMARY KEY,
  submission_id integer REFERENCES homework_submissions(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  content_type text,
  size bigint,
  uploaded_at timestamp DEFAULT now()
);

CREATE INDEX idx_homework_submission_attachments_submission_id ON homework_submission_attachments(submission_id);
