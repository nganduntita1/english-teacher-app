import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'English Teacher - Apprendre l\'Anglais',
  description: 'Application pour apprendre l\'anglais rapidement pour les francophones du Congo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <MobileBottomNav />
          <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-lg font-medium mb-2">
                Créé avec ❤️ par{' '}
                <span className="text-green-500 font-bold">Prince</span>
                {' '}(
                <a
                  href="https://instagram.com/ntita11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 font-bold transition-colors"
                >
                  @ntita11
                </a>
                )
              </p>
              <p className="text-sm text-slate-400">
                Application d&apos;apprentissage d&apos;anglais alimentée par l&apos;IA
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
