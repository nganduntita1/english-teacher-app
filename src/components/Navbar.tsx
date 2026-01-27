'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
            <span className="text-3xl md:text-4xl">📚</span>
            <span className="hidden sm:inline">English Teacher</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-emerald-200 font-semibold transition">
                  Tableau de Bord
                </Link>
                <Link href="/lessons" className="hover:text-emerald-200 font-semibold transition">
                  Leçons
                </Link>
                <Link href="/vocabulary" className="hover:text-emerald-200 font-semibold transition">
                  Vocabulaire
                </Link>
                <Link href="/admin" className="hover:text-purple-200 font-semibold transition text-purple-300">
                  ⚡ Générateur IA
                </Link>
                <Link href="/profile" className="hover:text-emerald-200 font-semibold transition">
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold transition transform hover:scale-105"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-emerald-200 font-semibold transition">
                  Connexion
                </Link>
                <Link href="/signup" className="bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-2 rounded-xl font-bold transition">
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-emerald-700 rounded-lg transition"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 border-t border-emerald-700 pt-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Tableau de Bord
                </Link>
                <Link
                  href="/lessons"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Leçons
                </Link>
                <Link
                  href="/vocabulary"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Vocabulaire
                </Link>
                <Link
                  href="/quizzes"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Quizzes
                </Link>
                <Link
                  href="/admin"
                  className="block px-4 py-3 hover:bg-purple-800 rounded-xl font-semibold transition text-purple-300"
                  onClick={() => setIsOpen(false)}
                >
                  ⚡ Panneau Admin
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-xl font-bold transition text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 hover:bg-emerald-800 rounded-xl font-semibold transition"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
