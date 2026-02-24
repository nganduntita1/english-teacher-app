'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Book, BookOpen, Brain, Zap } from 'lucide-react';

interface UserStats {
  lessonsCompleted: number;
  wordsLearned: number;
  averageQuizScore: number;
  streak: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    lessonsCompleted: 0,
    wordsLearned: 0,
    averageQuizScore: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        // Fetch lessons completed
        const { count: lessonsCount } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        // Fetch words learned
        const { count: wordsCount } = await supabase
          .from('learned_vocabulary')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats((prev) => ({
          ...prev,
          lessonsCompleted: lessonsCount || 0,
          wordsLearned: wordsCount || 0,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 pt-6 md:pt-8 pb-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-emerald-900 mb-2">
              Bon retour, {(user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.username || user?.email?.split('@')[0] || 'ami'} ! 👋
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium">
              Continuez votre apprentissage
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-slate-600 font-medium text-center">Chargement de vos progrès...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 md:mb-12">
              {/* Lessons Completed */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold">Leçons Terminées</h3>
                  <div className="bg-emerald-100 p-2.5 sm:p-3 rounded-xl">
                    <Book className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-emerald-600">
                  {stats.lessonsCompleted}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Continuez comme ça ! 🚀</p>
              </div>

              {/* Words Learned */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold">Mots Appris</h3>
                  <div className="bg-teal-100 p-2.5 sm:p-3 rounded-xl">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-teal-600">
                  {stats.wordsLearned}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Excellent vocabulaire ! 📚</p>
              </div>

              {/* Average Score */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold">Score Moyen Quiz</h3>
                  <div className="bg-amber-100 p-2.5 sm:p-3 rounded-xl">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-amber-600">
                  {stats.averageQuizScore}%
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Excellent travail ! ⭐</p>
              </div>

              {/* Streak */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold">Série d'Apprentissage</h3>
                  <div className="bg-rose-100 p-2.5 sm:p-3 rounded-xl">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-rose-600">
                  {stats.streak}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Jours d'affilée ! 🔥</p>
              </div>
            </div>
          )}

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                title: 'Leçons',
                description: 'Commencez à apprendre avec des leçons structurées',
                icon: '📖',
                href: '/lessons',
                color: 'from-emerald-500 to-teal-600',
              },
              {
                title: 'Vocabulaire',
                description: 'Élargissez votre vocabulaire avec des cartes',
                icon: '📝',
                href: '/vocabulary',
                color: 'from-teal-500 to-cyan-600',
              },
              {
                title: 'Quiz',
                description: 'Testez vos connaissances et améliorez-vous',
                icon: '✅',
                href: '/quizzes',
                color: 'from-cyan-500 to-blue-600',
              },
              {
                title: 'Profil',
                description: 'Gérez votre compte et paramètres',
                icon: '👤',
                href: '/profile',
                color: 'from-blue-500 to-indigo-600',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 md:p-8 bg-white shadow-sm hover:shadow-lg transition-all active:scale-95 sm:hover:scale-105"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                ></div>
                
                <div className="relative z-10">
                  <p className="text-3xl sm:text-4xl mb-3">{item.icon}</p>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2 group-hover:text-emerald-700">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-medium text-xs sm:text-sm">
                    {item.description}
                  </p>
                  <p className="text-emerald-600 font-bold text-xs sm:text-sm mt-4 group-hover:translate-x-2 transition-transform">
                    Commencer →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
