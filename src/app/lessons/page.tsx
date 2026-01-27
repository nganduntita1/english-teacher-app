'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
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
              <h1 className="text-4xl md:text-5xl font-bold text-emerald-900">
                Leçons d'Anglais
              </h1>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Maîtrisez l'anglais avec des leçons structurées et progressives conçues pour tous les niveaux.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Chargement des leçons...</p>
              </div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <p className="text-2xl text-slate-600 font-bold mb-3">
                📚 Aucune leçon pour le moment
              </p>
              <p className="text-slate-500 font-medium">
                Les leçons seront ajoutées très bientôt ! Revenez plus tard.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all p-8 md:p-10 border-l-8 border-emerald-500 hover:border-teal-500"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Content */}
                    <div className="flex-1">
                      {/* Lesson Number */}
                      <div className="inline-block mb-4">
                        <span className={`bg-gradient-to-r ${getLevelColor(lesson.level)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                          Leçon {index + 1}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl font-bold text-emerald-900 mb-3 group-hover:text-teal-700 transition">
                        {lesson.title}
                      </h2>

                      {/* Description */}
                      <p className="text-slate-600 font-medium text-lg mb-4">
                        {lesson.description}
                      </p>

                      {/* Level Badge */}
                      <div className="inline-flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">Niveau:</span>
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="group/btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                    >
                      Commencer la Leçon
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Motivational Footer */}
          {lessons.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-slate-600 font-medium text-lg">
                ✨ Commencez par la Leçon 1 et progressez à votre rythme !
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
