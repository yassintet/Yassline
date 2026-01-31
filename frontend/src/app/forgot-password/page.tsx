"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(response.error || t('forgotPassword.error'));
      }
    } catch (err) {
      setError(t('forgotPassword.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Forgot Password Card */}
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
                {t('forgotPassword.title')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('forgotPassword.subtitle')}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-1">
                    {t('forgotPassword.successTitle')}
                  </h3>
                  <p className="text-sm text-green-700">
                    {t('forgotPassword.successMessage')}
                  </p>
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
                {/* Email Input */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t('forgotPassword.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={t('forgotPassword.emailPlaceholder')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
