-- Supabase SQL setup script
-- Run these commands in the Supabase SQL editor to set up the database schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  level TEXT DEFAULT 'beginner',
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  french_meaning TEXT NOT NULL,
  example_en TEXT,
  example_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE learned_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, vocabulary_id)
);

CREATE TABLE vocabulary_daily_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  shown_date DATE NOT NULL,
  is_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, vocabulary_id, shown_date)
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_vocabulary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for lessons (public read)
CREATE POLICY "Lessons are readable by all"
  ON lessons
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert lessons"
  ON lessons
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for vocabulary (public read)
CREATE POLICY "Vocabulary is readable by all"
  ON vocabulary

  CREATE POLICY "Authenticated users can insert vocabulary"
    ON vocabulary
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  FOR SELECT
  USING (TRUE);

-- Create RLS policies for quiz_questions (public read)
CREATE POLICY "Quiz questions are readable by all"
  ON quiz_questions

  CREATE POLICY "Authenticated users can insert quiz questions"
    ON quiz_questions
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  FOR SELECT
  USING (TRUE);

-- Create RLS policies for user_progress
CREATE POLICY "Users can read their own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Create RLS policies for quiz_attempts
CREATE POLICY "Users can read their own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for learned_vocabulary
CREATE POLICY "Users can read their own learned vocabulary"
  ON learned_vocabulary
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own learned vocabulary"
  ON learned_vocabulary
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for vocabulary_daily_tracking
CREATE POLICY "Users can read their own daily tracking"
  ON vocabulary_daily_tracking
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own daily tracking"
  ON vocabulary_daily_tracking
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own daily tracking"
  ON vocabulary_daily_tracking
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own learned vocabulary"
  ON learned_vocabulary
  FOR DELETE
  USING (auth.uid()::text = user_id::text);
