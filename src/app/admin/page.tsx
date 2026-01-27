'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Zap, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const { user, session } = useAuth();
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerateLesson = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          level,
          topic: topic || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✅ Lesson created: "${result.data.lesson}" with ${result.data.vocabularyCount} words and ${result.data.quizCount} quiz questions`,
        });
        setGeneratedCount((prev) => prev + 1);
        setTopic('');
      } else {
        setMessage({
          type: 'error',
          text: `❌ Error: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to generate lesson: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Only allow admin (demo: just check if logged in)
  const isAdmin = !!user;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-10 h-10 text-purple-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-purple-900">Générateur de Contenu IA</h1>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Générez des leçons complètes avec vocabulaire et quiz alimentés par l'IA
            </p>
          </div>

          {!isAdmin ? (
            <div className="bg-red-50 rounded-3xl shadow-lg p-12 text-center border-2 border-red-200">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-2xl text-red-700 font-bold">Accès Refusé</p>
              <p className="text-red-600 font-medium mt-2">Seuls les administrateurs peuvent accéder à ce panneau.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
              {/* Form */}
              <div className="space-y-8 mb-8">
                <div>
                  <label className="block text-slate-700 font-semibold mb-4 text-lg">
                    Niveau de la Leçon
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                          level === l
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {l === 'beginner' ? 'Débutant' : l === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-3 text-lg">
                    Sujet (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="par ex., Anglais des Affaires, Voyages, Routines Quotidiennes"
                    className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-lg"
                  />
                  <p className="text-sm text-slate-500 font-medium mt-2">
                    Laissez vide pour que l'IA choisisse un sujet aléatoire
                  </p>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-2xl p-6 mb-8 flex items-start gap-3 ${
                    message.type === 'success'
                      ? 'bg-green-50 border-2 border-green-300 text-green-800'
                      : 'bg-red-50 border-2 border-red-300 text-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <p className="font-bold text-lg">{message.text}</p>
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleGenerateLesson}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Génération avec l'IA...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Générer une Nouvelle Leçon
                  </>
                )}
              </button>

              {/* Stats */}
              {generatedCount > 0 && (
                <div className="mt-12 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                  <p className="text-slate-600 font-semibold text-center mb-2">Leçons Générées Aujourd'hui</p>
                  <p className="text-5xl font-bold text-center text-purple-700">{generatedCount}</p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 rounded-2xl p-8 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Comment ça marche</h3>
            <ul className="space-y-3 text-blue-800 font-medium">
              <li>✅ Cliquez sur "Générer une Nouvelle Leçon" pour créer une leçon complète avec l'IA</li>
              <li>✅ Chaque leçon comprend un titre, une description, du contenu (~250 mots)</li>
              <li>✅ Génère automatiquement 8-12 mots de vocabulaire avec traductions françaises et exemples</li>
              <li>✅ Crée 5 questions à choix multiples avec explications</li>
              <li>✅ Tout le contenu est instantanément enregistré dans la base de données et apparaît dans l'application</li>
              <li>✅ Alimenté par Groq AI - Rapide, gratuit et fiable</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
