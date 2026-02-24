'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isValidUsername, normalizeUsername, toInternalEmail } from '@/lib/usernameAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const normalizedUsername = normalizeUsername(username);
    if (!isValidUsername(normalizedUsername)) {
      setError("Le nom d'utilisateur doit contenir 3-20 caracteres (lettres, chiffres, underscore).");
      return;
    }

    setLoading(true);

    try {
      const internalEmail = toInternalEmail(normalizedUsername);
      const { error: authError, data } = await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            username: normalizedUsername,
          },
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        // Create user profile
        if (data.user) {
          await supabase.from('users').insert([
            {
              id: data.user.id,
              email: internalEmail,
              full_name: fullName,
              username: normalizedUsername,
            },
          ]);
        }
        setSuccess('Account created successfully! You can now sign in.');
        setTimeout(() => router.push('/login'), 2000);
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
          <h1 className="text-3xl font-bold text-emerald-900">Créer un Compte</h1>
          <p className="text-slate-600 font-medium mt-2">Rejoignez des milliers de personnes apprenant l'anglais</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-2xl mb-6 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-300 text-green-700 px-5 py-4 rounded-2xl mb-6 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Nom Complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="Votre nom"
                required
              />
            </div>

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
              <p className="text-xs text-slate-500 mt-2">
                3-20 caractères, lettres, chiffres, underscore.
              </p>
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

            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Confirmer le Mot de Passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Création du compte...' : 'Créer un Compte'}
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

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-slate-600 font-medium mb-3">
              Vous avez déjà un compte ?
            </p>
            <Link
              href="/login"
              className="inline-block bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-3 px-6 rounded-2xl border-2 border-emerald-200 transition-all w-full"
            >
              Se Connecter
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm font-medium mt-6">
          Apprendre l'anglais n'a jamais été aussi facile ! 🎯
        </p>
      </div>
    </div>
  );
}
