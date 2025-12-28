-- Create initial schema
CREATE TABLE users (
  id serial PRIMARY KEY,
  email varchar(255) UNIQUE NOT NULL,
  username varchar(100) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  full_name varchar(255),
  role varchar(50) NOT NULL,
  average_score double precision DEFAULT 0,
  total_score integer DEFAULT 0,
  created_at timestamp default now()
);

CREATE TABLE subjects (
  id serial PRIMARY KEY,
  code varchar(100) UNIQUE NOT NULL,
  title varchar(255) NOT NULL,
  icon_url varchar(1024),
  is_mandatory boolean DEFAULT false,
  category varchar(50),
  max_score integer
);

CREATE TABLE questions (
  id serial PRIMARY KEY,
  text text,
  points integer DEFAULT 1,
  explanation text,
  subject_id integer references subjects(id) on delete cascade
);

CREATE TABLE options (
  id serial PRIMARY KEY,
  text text,
  is_correct boolean DEFAULT false,
  question_id integer references questions(id) on delete cascade
);

CREATE TABLE test_results (
  id serial PRIMARY KEY,
  user_id integer references users(id) on delete cascade,
  subject_id integer references subjects(id) on delete cascade,
  score integer,
  max_score integer,
  total_questions integer,
  correct_answers integer,
  completed_at timestamp default now()
);

CREATE TABLE video_lessons (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  subject_id integer references subjects(id) on delete set null,
  youtube_url varchar(1024),
  thumbnail varchar(1024),
  duration varchar(50),
  description text
);

CREATE TABLE homework (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  subject_id integer references subjects(id) on delete set null,
  due_date date,
  assigned_by varchar(100)
);
