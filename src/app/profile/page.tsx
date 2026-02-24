'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { User, Lock, LogOut, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface UserProfile {
  email: string;
  full_name: string;
  username: string;
  created_at: string;
}

interface Stats {
  lessonsStarted: number;
  lessonsCompleted: number;
  totalWordsLearned: number;
  quizzesAttempted: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    lessonsStarted: 0,
    lessonsCompleted: 0,
    totalWordsLearned: 0,
    quizzesAttempted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'password' | 'settings'>('overview');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user progress stats
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        const { data: learnedData } = await supabase
          .from('learned_vocabulary')
          .select('*')
          .eq('user_id', user.id);

        const { data: quizData } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id);

        setStats({
          lessonsStarted: progressData?.length || 0,
          lessonsCompleted: progressData?.filter((p: any) => p.completed).length || 0,
          totalWordsLearned: learnedData?.length || 0,
          quizzesAttempted: quizData?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteLoading(true);

    try {
      // Delete user data first
      await supabase.from('users').delete().eq('id', user.id);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      // Redirect to home
      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center pb-24 md:pb-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement du profil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24 md:pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile?.full_name || 'User'}</h1>
                <p className="text-emerald-100">@{profile?.username || 'utilisateur'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-emerald-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  activeTab === 'password'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Sécurité
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                Paramètres
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Profile Info Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User size={24} className="text-emerald-600" />
                  Informations du Profil
                </h2>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Nom Complet</p>
                    <p className="text-lg font-semibold text-slate-800">{profile?.full_name || 'Non défini'}</p>
                  </div>
                  <div className="pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Nom d'utilisateur</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {profile?.username || 'Non défini'}
                    </p>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-slate-600 mb-1">Membre Depuis</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-2 font-semibold">Leçons Commencées</p>
                  <p className="text-4xl font-bold text-emerald-900">{stats.lessonsStarted}</p>
                  <p className="text-xs text-emerald-600 mt-2">Continuez à apprendre !</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2 font-semibold">Leçons Terminées</p>
                  <p className="text-4xl font-bold text-blue-900">{stats.lessonsCompleted}</p>
                  <p className="text-xs text-blue-600 mt-2">Excellent progrès !</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-2 font-semibold">Mots Appris</p>
                  <p className="text-4xl font-bold text-purple-900">{stats.totalWordsLearned}</p>
                  <p className="text-xs text-purple-600 mt-2">Élargissement du vocabulaire !</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <p className="text-sm text-amber-700 mb-2 font-semibold">Quiz Tentés</p>
                  <p className="text-4xl font-bold text-amber-900">{stats.quizzesAttempted}</p>
                  <p className="text-xs text-amber-600 mt-2">Test des connaissances !</p>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Lock size={24} className="text-emerald-600" />
                  Changer le Mot de Passe
                </h2>

                {passwordMessage && (
                  <div
                    className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm font-semibold ${
                        passwordMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {passwordMessage.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nouveau Mot de Passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez le nouveau mot de passe"
                      required
                      minLength={6}
                      className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 caractères</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirmer le Mot de Passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                      required
                      minLength={6}
                      className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword || !confirmPassword}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition ${
                      passwordLoading || !newPassword || !confirmPassword
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {passwordLoading ? 'Mise à jour...' : 'Mettre à Jour le Mot de Passe'}
                  </button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    💡 <span className="font-semibold">Astuce:</span> Utilisez un mot de passe fort avec des majuscules, minuscules, chiffres et symboles pour une meilleure sécurité.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              {/* Danger Zone */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-red-200">
                <h2 className="text-2xl font-bold text-red-700 mb-6">Zone Dangereuse</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl">
                    <h3 className="font-semibold text-red-900 mb-2">Supprimer le Compte</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Veuillez être certain.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        Supprimer Mon Compte
                      </button>
                    ) : (
                      <div className="space-y-4 p-4 bg-white border-2 border-red-400 rounded-xl">
                        <p className="text-sm font-semibold text-red-900">
                          ⚠️ Êtes-vous absolument sûr ? Cette action ne peut pas être annulée.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-6 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition font-semibold text-sm"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className={`px-6 py-2 rounded-xl transition font-semibold text-sm text-white ${
                              deleteLoading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {deleteLoading ? 'Suppression...' : 'Oui, Supprimer Mon Compte'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LogOut size={24} className="text-emerald-600" />
                  Déconnexion
                </h2>
                <p className="text-slate-600 mb-4">Déconnectez-vous de cet appareil</p>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/');
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
                >
                  Se Déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
