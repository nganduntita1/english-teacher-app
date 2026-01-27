'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8 md:pt-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl mb-6 shadow-lg">
            <span className="text-4xl">📚</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-emerald-900 mb-4">
            English Teacher
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-700 mb-4 font-semibold">
            Apprenez l'Anglais, Maîtrisez le Succès
          </p>
          
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
            Votre plateforme moderne pour apprendre l'anglais avec des leçons interactives, du vocabulaire et des quiz
          </p>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Aller au Tableau de Bord →
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="inline-block bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-4 px-10 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Créer un Compte
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="card bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              Leçons Structurées
            </h2>
            <p className="text-slate-600 font-medium">
              Des leçons progressives conçues pour développer vos compétences en anglais du débutant au niveau avancé
            </p>
          </div>

          <div className="card bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              Vocabulaire Interactif
            </h2>
            <p className="text-slate-600 font-medium">
              Apprenez du vocabulaire avec des cartes interactives, des exemples et des prononciations natives
            </p>
          </div>

          <div className="card bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              Quiz & Pratique
            </h2>
            <p className="text-slate-600 font-medium">
              Testez vos connaissances avec des quiz engageants et suivez vos progrès
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { number: '1000+', label: 'Mots à Apprendre' },
            { number: '50+', label: 'Leçons' },
            { number: '100%', label: 'Gratuit' },
            { number: '24/7', label: 'Accès' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{stat.number}</p>
              <p className="text-slate-600 font-semibold text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
