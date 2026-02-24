'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Home, User, FileQuestion, BookMarked } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/lessons', label: 'Lecons', icon: BookOpen },
  { href: '/vocabulary', label: 'Vocabulaire', icon: BookMarked },
  { href: '/quizzes', label: 'Quiz', icon: FileQuestion },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="sm:hidden">
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-100 bg-white/95 backdrop-blur shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto max-w-7xl px-3">
          <div className="grid grid-cols-5 gap-1 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="h-16" aria-hidden="true"></div>
    </div>
  );
}
