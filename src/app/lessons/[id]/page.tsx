'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/userProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { speak, isSpeechSupported } from '@/lib/speech';
import { ArrowLeft, BookOpen, CheckCircle, Volume2 } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  level: string;
}

interface Vocabulary {
  id: string;
  word: string;
  french_meaning: string;
  example_en: string;
  example_fr: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'content' | 'vocabulary' | 'quiz'>(
    initialTab === 'quiz' ? 'quiz' : initialTab === 'vocabulary' ? 'vocabulary' : 'content'
  );
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

        // Fetch vocabulary for this lesson
        const { data: vocabData, error: vocabError } = await supabase
          .from('vocabulary')
          .select('*')
          .eq('lesson_id', lessonId);

        if (vocabError) throw vocabError;
        setVocabulary(vocabData || []);

        // Fetch quiz questions for this lesson
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('lesson_id', lessonId);

        if (quizError) throw quizError;
        setQuizQuestions(quizData || []);

        // Track lesson access - create or update user_progress
        if (user) {
          await ensureUserProfile(user);

          const { data: existingProgress, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

          if (progressError) {
            console.error('Error checking lesson progress:', progressError);
          } else if (!existingProgress) {
            // Create new progress entry when user first opens the lesson
            const { error: insertError } = await supabase.from('user_progress').insert({
              user_id: user.id,
              lesson_id: lessonId,
              completed: false,
              last_accessed: new Date().toISOString(),
            });

            if (insertError) {
              console.error('Error creating lesson progress:', insertError);
            }
          } else {
            // Update last accessed time
            const { error: updateError } = await supabase
              .from('user_progress')
              .update({
                last_accessed: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('lesson_id', lessonId);

            if (updateError) {
              console.error('Error updating lesson progress access time:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId, user]);
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


  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!quizSubmitted) {
      setQuizAnswers({
        ...quizAnswers,
        [questionId]: answer,
      });
    }
  };

  const submitQuiz = async () => {
    if (!user) return;

    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setQuizSubmitted(true);

    try {
      await ensureUserProfile(user);

      // Save quiz attempt to database
      const totalQuestions = quizQuestions.length;
      const percentage = Math.round((correctCount / totalQuestions) * 100);

      const { error: quizAttemptError } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        lesson_id: lessonId,
        score: correctCount,
        total_questions: totalQuestions,
        percentage: percentage,
      });

      if (quizAttemptError) {
        console.error('Error saving quiz attempt:', quizAttemptError);
      }

      // Update lesson progress
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (progressError) {
        console.error('Error checking lesson progress:', progressError);
        return;
      }

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            completed: percentage >= 70, // Mark as completed if score is 70% or higher
            last_accessed: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        if (updateError) {
          console.error('Error updating quiz progress:', updateError);
        }
      } else {
        // Create new progress entry
        const { error: insertError } = await supabase.from('user_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: percentage >= 70,
          last_accessed: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating quiz progress:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  const goToNextTab = () => {
    if (activeTab === 'content') setActiveTab('vocabulary');
    else if (activeTab === 'vocabulary') setActiveTab('quiz');
  };

  const goToPrevTab = () => {
    if (activeTab === 'vocabulary') setActiveTab('content');
    else if (activeTab === 'quiz') setActiveTab('vocabulary');
  };

  const handleFinishLesson = () => {
    router.push('/lessons');
  };

  const tabOrder = ['content', 'vocabulary', 'quiz'] as const;
  const currentTabIndex = tabOrder.indexOf(activeTab as any);
  const canGoNext = currentTabIndex < tabOrder.length - 1;
  const canGoPrev = currentTabIndex > 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement de la leçon...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lesson) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 text-lg">Leçon non trouvée</p>
            <button
              onClick={() => router.push('/lessons')}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              Retour aux Leçons
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/lessons')}
              className="flex items-center gap-2 hover:text-emerald-200 transition mb-4"
            >
              <ArrowLeft size={20} />
              Retour aux Leçons
            </button>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={32} />
              <h1 className="text-3xl md:text-4xl font-bold">{lesson.title}</h1>
            </div>
            <p className="text-emerald-100 mb-4">{lesson.description}</p>
            <span className={`inline-block px-4 py-1 rounded-lg text-sm font-semibold capitalize ${getLevelBadgeColor(lesson.level)}`}>
              {lesson.level}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-emerald-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 md:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-3 md:px-2 font-semibold border-b-2 transition whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'content'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Contenu
              </button>
              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`py-4 px-3 md:px-2 font-semibold border-b-2 transition whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'vocabulary'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Vocabulaire ({vocabulary.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-4 px-3 md:px-2 font-semibold border-b-2 transition whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'quiz'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Quiz ({quizQuestions.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Contenu de la Leçon</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                    {lesson.content}
                  </p>
                </div>
              </div>
              {vocabulary.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-emerald-200">
                  <h3 className="text-lg md:text-xl font-bold text-emerald-900 mb-4">Aperçu: Vocabulaire clé</h3>
                  <div className="grid gap-4">
                    {vocabulary.slice(0, 3).map((word) => (
                      <div key={word.id} className="bg-white rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-base md:text-lg font-semibold text-emerald-700">{word.word}</p>
                            <p className="text-sm text-slate-600 mt-1">{word.french_meaning}</p>
                            <p className="text-xs md:text-sm text-slate-700 mt-2 italic">"{word.example_en}"</p>
                          </div>
                          <button
                            onClick={() => handleSpeak(word.word, word.id)}
                            disabled={speakingWord === word.id}
                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="Pronounce word"
                          >
                            <Volume2 className={`h-4 w-4 ${speakingWord === word.id ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('vocabulary')}
                    className="mt-4 w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
                  >
                    Voir tout le vocabulaire →
                  </button>
                </div>
              )}

              {vocabulary.length > 0 && (
                <div className="flex gap-3 mt-6 flex-col-reverse sm:flex-row">
                  <button
                    onClick={goToPrevTab}
                    disabled={!canGoPrev}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={goToNextTab}
                    disabled={!canGoNext}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vocabulary Tab */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Vocabulaire</h2>
              {vocabulary.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-12 text-center">
                  <p className="text-slate-600">Aucun vocabulaire disponible pour cette leçon.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {vocabulary.map((word, index) => (
                    <div key={word.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition border-l-4 border-emerald-500">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                          <span className="w-7 h-7 md:w-8 md:h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                            <h3 className="text-base md:text-xl font-bold text-emerald-700">{word.word}</h3>
                          </div>
                          <p className="text-xs md:text-sm text-slate-600 mb-3">{word.french_meaning}</p>
                          <div className="bg-slate-50 rounded-lg p-3 md:p-4 space-y-2">
                            <p className="text-xs md:text-sm text-slate-700">
                              <span className="font-semibold">English:</span> {word.example_en}
                            </p>
                            <p className="text-xs md:text-sm text-slate-700">
                              <span className="font-semibold">Français:</span> {word.example_fr}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSpeak(word.word, word.id)}
                          disabled={speakingWord === word.id}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="Pronounce word"
                        >
                          <Volume2 className={`h-4 w-4 ${speakingWord === word.id ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6 flex-col-reverse sm:flex-row">
                  <button
                    onClick={goToPrevTab}
                    disabled={!canGoPrev}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={goToNextTab}
                    disabled={!canGoNext}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant: Quiz →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Quiz</h2>
              {quizQuestions.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-12 text-center">
                  <p className="text-slate-600">Aucun quiz disponible pour cette leçon pour le moment.</p>
                </div>
              ) : (
                <>
                  {quizSubmitted && (
                    <div className={`rounded-2xl p-6 text-center ${score >= quizQuestions.length * 0.7 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex justify-center mb-4">
                        {score >= quizQuestions.length * 0.7 ? (
                          <CheckCircle size={48} className="text-green-600" />
                        ) : (
                          <BookOpen size={48} className="text-yellow-600" />
                        )}
                      </div>
                      <p className={`text-2xl font-bold mb-2 ${score >= quizQuestions.length * 0.7 ? 'text-green-700' : 'text-yellow-700'}`}>
                        Score: {score} / {quizQuestions.length}
                      </p>
                      <p className={`text-sm mb-4 ${score >= quizQuestions.length * 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {score >= quizQuestions.length * 0.7 ? '🎉 Excellent !' : 'Continue à pratiquer !'}
                      </p>
                      <div className="flex gap-3 flex-col-reverse sm:flex-row mt-6">
                        <button
                          onClick={resetQuiz}
                          className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition font-semibold"
                        >
                          Reprendre le Quiz
                        </button>
                        <button
                          onClick={handleFinishLesson}
                          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
                        >
                          ✓ Terminer la leçon
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
                        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">
                          <span className="w-7 h-7 md:w-8 md:h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs md:text-sm font-bold mr-3 inline-flex">
                            {index + 1}
                          </span>
                          {question.question}
                        </h3>

                        <div className="space-y-3">
                          {question.options.map((option, optIndex) => {
                            const isSelected = quizAnswers[question.id] === option;
                            const isCorrect = option === question.correct_answer;

                            let buttonStyle = 'border-2 border-slate-200 bg-white hover:border-emerald-400';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                buttonStyle = 'border-2 border-green-500 bg-green-50';
                              } else if (isSelected && !isCorrect) {
                                buttonStyle = 'border-2 border-red-500 bg-red-50';
                              }
                            } else if (isSelected) {
                              buttonStyle = 'border-2 border-emerald-600 bg-emerald-50';
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleAnswerSelect(question.id, option)}
                                disabled={quizSubmitted}
                                className={`w-full text-left p-3 md:p-4 rounded-xl transition text-sm md:text-base ${buttonStyle} ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected 
                                      ? quizSubmitted 
                                        ? isCorrect 
                                          ? 'border-green-500 bg-green-500' 
                                          : 'border-red-500 bg-red-500'
                                        : 'border-emerald-600 bg-emerald-600'
                                      : 'border-slate-300'
                                  }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                  <span className={isSelected ? 'font-semibold' : ''}>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`mt-4 p-3 md:p-4 rounded-lg text-sm md:text-base ${quizAnswers[question.id] === question.correct_answer ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                            <p className={`${quizAnswers[question.id] === question.correct_answer ? 'text-green-700' : 'text-blue-700'}`}>
                              <span className="font-semibold">Explication :</span> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted && (
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition text-base md:text-lg ${
                        Object.keys(quizAnswers).length === quizQuestions.length
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Soumettre le Quiz ({Object.keys(quizAnswers).length} / {quizQuestions.length})
                    </button>
                  )}

                  {!quizSubmitted && (
                    <div className="flex gap-3 mt-4 flex-col-reverse sm:flex-row">
                      <button
                        onClick={goToPrevTab}
                        disabled={!canGoPrev}
                        className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Précédent
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
