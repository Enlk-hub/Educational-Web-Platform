CREATE TABLE homework_submissions (
  id serial PRIMARY KEY,
  homework_id integer REFERENCES homework(id) ON DELETE CASCADE,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status varchar(30) DEFAULT 'SUBMITTED',
  feedback text,
  grade integer,
  submitted_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX idx_homework_submissions_user_id ON homework_submissions(user_id);
