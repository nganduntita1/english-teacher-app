'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { speak, isSpeechSupported } from '@/lib/speech';
import { BookMarked, BookOpen, CheckCircle, Volume2 } from 'lucide-react';

interface VocabularyItem {
  id: string;
  word: string;
  french_meaning: string;
  example_en: string;
  example_fr: string;
  lesson_id: string;
}

export default function VocabularyPage() {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [dailyWords, setDailyWords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'learned' | 'unlearned' | 'daily'>('daily');
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function fetchVocabulary() {
      try {
        const { data, error } = await supabase
          .from('vocabulary')
          .select('*')
          .order('word', { ascending: true });

        if (error) throw error;
        setVocabulary(data || []);

        if (user) {
          const { data: learnedData } = await supabase
            .from('learned_vocabulary')
            .select('vocabulary_id')
            .eq('user_id', user.id);

          const learnedSet = new Set<string>(
            learnedData?.map((item: any) => item.vocabulary_id) || []
          );
          setLearnedIds(learnedSet);

          // Fetch today's vocabulary
          const today = new Date().toISOString().split('T')[0];
          const { data: dailyData, error: dailyError } = await supabase
            .from('vocabulary_daily_tracking')
            .select('vocabulary_id')
            .eq('user_id', user.id)
            .eq('shown_date', today);

          if (!dailyError) {
            const dailySet = new Set<string>(
              dailyData?.map((item: any) => item.vocabulary_id) || []
            );
            setDailyWords(dailySet);

            // If no words for today, generate 10 new unlearned words
            if (dailySet.size === 0 && data) {
              const unlearnedWords = (data as VocabularyItem[]).filter(
                (v) => !learnedSet.has(v.id)
              );
              const wordsToShow = unlearnedWords.slice(0, 10);

              if (wordsToShow.length > 0) {
                const trackingEntries = wordsToShow.map((w) => ({
                  user_id: user.id,
                  vocabulary_id: w.id,
                  shown_date: today,
                  is_review: false,
                }));

                await supabase
                  .from('vocabulary_daily_tracking')
                  .insert(trackingEntries);

                setDailyWords(
                  new Set(wordsToShow.map((w) => w.id))
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching vocabulary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVocabulary();
  }, [user]);

  const handleSpeak = async (word: string, vocabId: string) => {
    if (!isSpeechSupported()) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    setSpeakingWord(vocabId);
    try {
      await speak(word);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setSpeakingWord(null);
    }
  };

  const toggleLearned = async (vocabId: string) => {
    if (!user) return;

    try {
      if (learnedIds.has(vocabId)) {
        const { error } = await supabase
          .from('learned_vocabulary')
          .delete()
          .eq('user_id', user.id)
          .eq('vocabulary_id', vocabId);

        if (error) {
          console.error('Error deleting learned vocabulary:', error);
          alert('Failed to update: ' + error.message);
          return;
        }

        const newSet = new Set(learnedIds);
        newSet.delete(vocabId);
        setLearnedIds(newSet);
      } else {
        const { error: insertError } = await supabase
          .from('learned_vocabulary')
          .upsert([
            {
              user_id: user.id,
              vocabulary_id: vocabId,
            },
          ], { onConflict: 'user_id,vocabulary_id' });

        if (insertError) {
          console.error('Error inserting learned vocabulary:', insertError ?? 'Unknown error');
          alert('Failed to save: ' + (insertError?.message ?? 'Unknown error'));
          return;
        }

        setLearnedIds(new Set([...learnedIds, vocabId]));
      }
    } catch (error: any) {
      console.error('Error updating learned vocabulary:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  const filteredVocabulary = vocabulary.filter((word) => {
    if (filter === 'learned') return learnedIds.has(word.id);
    if (filter === 'unlearned') return !learnedIds.has(word.id);
    if (filter === 'daily') {
      return showReview
        ? dailyWords.has(word.id) && learnedIds.has(word.id)
        : dailyWords.has(word.id) && !learnedIds.has(word.id);
    }
    return true;
  });

  const learnedCount = Array.from(learnedIds).filter((id) =>
    vocabulary.some((v) => v.id === id)
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BookMarked className="w-10 h-10 text-emerald-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-emerald-900">
                Constructeur de Vocabulaire
              </h1>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Élargissez votre vocabulaire anglais avec des cartes d'apprentissage interactives
            </p>
          </div>

          {/* Stats & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 font-semibold text-sm mb-2">Progrès</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {learnedCount} / {vocabulary.length}
                  </p>
                  <div className="mt-3 bg-slate-200 rounded-full h-2 w-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all"
                      style={{
                        width: `${vocabulary.length > 0 ? (learnedCount / vocabulary.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex gap-3 flex-wrap items-center mb-4">
                {['daily', 'learned', 'unlearned', 'all'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f as any);
                      if (f === 'daily') setShowReview(false);
                    }}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'daily' ? 'Quotidien' : f === 'learned' ? 'Appris' : f === 'unlearned' ? 'Non Appris' : 'Tous'}
                  </button>
                ))}
              </div>
              {filter === 'daily' && (
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => setShowReview(false)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${!
                      showReview
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Nouveaux ({dailyWords.size - Array.from(dailyWords).filter(id => learnedIds.has(id)).length})
                  </button>
                  <button
                    onClick={() => setShowReview(true)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${showReview
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Révision ({Array.from(dailyWords).filter(id => learnedIds.has(id)).length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vocabulary Cards */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Chargement du vocabulaire...</p>
              </div>
            </div>
          ) : filteredVocabulary.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-2xl text-slate-600 font-bold mb-2">
                {filter === 'learned' && 'Aucun mot appris encore'}
                {filter === 'unlearned' && 'Tous les mots sont appris ! 🎉'}
                {filter === 'all' && 'Aucun vocabulaire disponible'}
              </p>
              <p className="text-slate-500 font-medium">
                {filter === 'learned' && 'Commencez à marquer des mots comme appris pour les voir ici.'}
                {filter === 'unlearned' && 'Revenez demain pour plus de mots à apprendre !'}
                {filter === 'all' && 'Le vocabulaire sera ajouté bientôt !'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVocabulary.map((word) => (
                <div
                  key={word.id}
                  className={`group rounded-2xl p-6 md:p-8 transition-all transform hover:scale-105 ${
                    learnedIds.has(word.id)
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 shadow-lg'
                      : 'bg-white border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300'
                  }`}
                >
                  {/* Word Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-900 mb-1">
                        {word.word}
                      </h3>
                      <p className="text-slate-700 font-semibold">
                        {word.french_meaning}
                      </p>
                    </div>
                    {learnedIds.has(word.id) && (
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Examples */}
                  {word.example_en && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-slate-600 font-semibold mb-2">Exemple:</p>
                      <p className="text-slate-800 font-medium italic mb-2">
                        "{word.example_en}"
                      </p>
                      <p className="text-sm text-slate-600">
                        ({word.example_fr})
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSpeak(word.word, word.id)}
                      disabled={speakingWord === word.id}
                      className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Pronounce word"
                    >
                      <Volume2 className={`h-5 w-5 ${speakingWord === word.id ? 'animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleLearned(word.id)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                        learnedIds.has(word.id)
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 border-2 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {learnedIds.has(word.id) ? '✓ Appris' : '📌 Marquer comme Appris'}
                    </button>
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
