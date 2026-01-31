"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const token = params?.token as string;
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.tokenInvalid'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordsNotMatch'));
      return;
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      setError(t('resetPassword.newPasswordPlaceholder'));
      return;
    }

    if (!token) {
      setError(t('resetPassword.tokenInvalid'));
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, newPassword);

      if (response.success) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.error || t('resetPassword.error'));
      }
    } catch (err) {
      setError(t('resetPassword.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)] pt-24 pb-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('resetPassword.error')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('resetPassword.tokenInvalid')}
              </p>
              <Link
                href="/forgot-password"
                className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-medium"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Reset Password Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/">
                <h1 className="text-3xl font-bold text-[var(--yass-gold)] mb-2">
                  Yassline Tour
                </h1>
              </Link>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('resetPassword.title')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('resetPassword.subtitle')}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-1">
                    {t('resetPassword.successTitle')}
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    {t('resetPassword.successMessage')}
                  </p>
                  <Link
                    href="/login"
                    className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                  >
                    {t('resetPassword.goToLogin')}
                  </Link>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Input */}
                <div>
                  <label 
                    htmlFor="newPassword" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t('resetPassword.newPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={t('resetPassword.newPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t('resetPassword.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? t('resetPassword.resetting') : t('resetPassword.resetPassword')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
