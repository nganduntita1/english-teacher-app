'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isValidUsername, normalizeUsername, toInternalEmail } from '@/lib/usernameAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedUsername = normalizeUsername(username);
      if (!isValidUsername(normalizedUsername)) {
        setError("Le nom d'utilisateur doit contenir 3-20 caracteres (lettres, chiffres, underscore).");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: toInternalEmail(normalizedUsername),
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-900">Connexion</h1>
          <p className="text-slate-600 font-medium mt-2">Bon retour sur English Teacher</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-2xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="votre_nom"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Mot de Passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 px-6 rounded-2xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-600 font-medium">ou</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-600 font-medium mb-3">
              Vous n'avez pas de compte ?
            </p>
            <Link
              href="/signup"
              className="inline-block bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-3 px-6 rounded-2xl border-2 border-emerald-200 transition-all w-full"
            >
              Créer un Compte
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm font-medium mt-6">
          Prêt à apprendre ? C'est parti ! 🚀
        </p>
      </div>
    </div>
  );
}
