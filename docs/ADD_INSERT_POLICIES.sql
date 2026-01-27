-- Run these commands in the Supabase SQL Editor to add INSERT policies
-- for AI content generation

-- Update lessons INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON lessons;
CREATE POLICY "Authenticated users can insert lessons"
  ON lessons
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add vocabulary INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert vocabulary" ON vocabulary;
CREATE POLICY "Authenticated users can insert vocabulary"
  ON vocabulary
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add quiz_questions INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert quiz questions" ON quiz_questions;
CREATE POLICY "Authenticated users can insert quiz questions"
  ON quiz_questions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
