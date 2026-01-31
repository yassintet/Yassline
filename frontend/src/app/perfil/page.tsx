"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userAPI, authAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Star,
  Award,
  Calendar,
  TrendingUp,
  Gift,
  Bell
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { useI18n } from "@/lib/i18n/context";

export default function PerfilPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [nextLevel, setNextLevel] = useState<any>(null);
  
  // Form states
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await userAPI.getProfile();
      if (response.success && response.data) {
        const profileData = response.data as any;
        const { user, stats: profileStats, nextLevel: next } = profileData;
        setProfile(user);
        setStats(profileStats);
        setNextLevel(next);
        setNombre(user?.nombre || "");
        setEmail(user?.email || "");
        setTelefono(user?.telefono || "");
      } else {
        setError(response.error || t('profile.errorLoading'));
      }
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError(err.message || t('profile.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await userAPI.updateProfile({
        nombre: nombre.trim() || undefined,
        email: email.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });

      if (response.success) {
        setSuccess(t('profile.updateSuccess'));
        await loadProfile();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || t('profile.updateError'));
      }
    } catch (err: any) {
      console.error('Error actualizando perfil:', err);
      setError(err.message || t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('profile.passwordTooShort'));
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setSuccess("");

      const response = await userAPI.changePassword(currentPassword, newPassword);

      if (response.success) {
        setSuccess(t('profile.passwordChanged'));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || t('profile.passwordError'));
      }
    } catch (err: any) {
      console.error('Error cambiando contraseña:', err);
      setError(err.message || t('profile.passwordError'));
    } finally {
      setChangingPassword(false);
    }
  };

  const getMembershipColor = (level: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-purple-100 text-purple-800 border-purple-300',
      diamante: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[level] || colors.bronze;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="pt-32 pb-16">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6 text-[var(--yass-gold)]" />
                  <h3 className="text-sm font-semibold text-gray-600">{t('profile.stats.totalBookings')}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-600">{t('profile.stats.confirmedBookings')}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.confirmedBookings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Gift className="h-6 w-6 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-600">{t('profile.stats.favorites')}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-6 w-6 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-600">{t('profile.stats.notifications')}</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.unreadNotifications}</p>
              </div>
            </div>
          )}

          {/* Información de membresía */}
          {profile && (
            <div className="bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-xl shadow-lg p-6 text-white mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">{t('profile.membershipLevel')}</p>
                    <p className="text-2xl font-bold capitalize">{t(`profile.membership.${profile.membershipLevel}`)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Star className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">{t('profile.points')}</p>
                    <p className="text-3xl font-bold">{profile.points?.toLocaleString() || 0}</p>
                    <p className="text-sm opacity-80 mt-1">≈ {((profile.points || 0) * 10).toLocaleString()} MAD</p>
                  </div>
                </div>
              </div>
              {nextLevel && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm opacity-90 mb-2">
                    {t('profile.nextLevel')}: <span className="font-bold capitalize">{t(`profile.membership.${nextLevel.level}`)}</span>
                  </p>
                  <p className="text-sm opacity-80">
                    {t('profile.pointsNeeded')}: {nextLevel.pointsNeeded.toLocaleString()} puntos ({nextLevel.madNeeded.toLocaleString()} MAD)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editar Perfil */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-[var(--yass-gold)]" />
                {t('profile.editProfile')}
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.name')}
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.phonePlaceholder')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[var(--yass-gold)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('profile.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('profile.save')}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lock className="h-6 w-6 text-[var(--yass-gold)]" />
                {t('profile.changePassword')}
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.currentPassword')}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.currentPasswordPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.newPasswordPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full bg-[var(--yass-gold)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('profile.changing')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      {t('profile.changePassword')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
