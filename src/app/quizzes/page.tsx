'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { BookOpen, CheckCircle, Timer, Zap } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  order_index: number | null;
}

export default function QuizzesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: lessonsData, error: lessonsError }, { data: quizData, error: quizError }] =
          await Promise.all([
            supabase
              .from('lessons')
              .select('id, title, description, level, order_index')
              .order('order_index', { ascending: true }),
            supabase.from('quiz_questions').select('id, lesson_id'),
          ]);

        if (lessonsError) throw lessonsError;
        if (quizError) throw quizError;

        setLessons(lessonsData || []);
        const counts: Record<string, number> = {};
        (quizData || []).forEach((q) => {
          counts[q.lesson_id] = (counts[q.lesson_id] || 0) + 1;
        });
        setQuizCounts(counts);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalQuizzes = useMemo(() => Object.values(quizCounts).reduce((a, b) => a + b, 0), [quizCounts]);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'from-emerald-500 to-teal-500';
      case 'intermediate':
        return 'from-blue-500 to-cyan-500';
      case 'advanced':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-emerald-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-emerald-900">Quizzes</h1>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Test your knowledge with quick quizzes for every lesson.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-emerald-800">
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full">
                <CheckCircle className="h-4 w-4" /> Lesson-linked quizzes
              </span>
              <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-2 rounded-full">
                <Timer className="h-4 w-4" /> Instant scoring
              </span>
              <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-2 rounded-full">
                <Zap className="h-4 w-4" /> Explanations included
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <p className="text-sm text-slate-600 font-semibold">Total lessons with quizzes</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{lessons.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <p className="text-sm text-slate-600 font-semibold">Total questions</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{totalQuizzes}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <p className="text-sm text-slate-600 font-semibold">Average per lesson</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">
                {lessons.length > 0 ? (totalQuizzes / lessons.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading quizzes...</p>
              </div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <p className="text-2xl text-slate-600 font-bold mb-3">No lessons yet</p>
              <p className="text-slate-500 font-medium">Add lessons to start quizzing.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all p-8 md:p-10 border-l-8 border-emerald-500 hover:border-teal-500"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="inline-block mb-4">
                        <span className={`bg-gradient-to-r ${getLevelColor(lesson.level)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                          Lesson {lesson.order_index ?? index + 1}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-emerald-900 mb-3 group-hover:text-teal-700 transition">
                        {lesson.title}
                      </h2>
                      <p className="text-slate-600 font-medium text-lg mb-4">{lesson.description}</p>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                          {quizCounts[lesson.id] || 0} questions
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          Level: {lesson.level}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/lessons/${lesson.id}?tab=quiz`}
                      className="group/btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                    >
                      Start Quiz
                      <Zap className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
