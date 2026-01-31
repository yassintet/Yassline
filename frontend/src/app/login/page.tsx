"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        // Guardar token y usuario
        const authData = response.data as { token?: string; user?: any };
        const { token, user } = authData;
        
        console.log('🔐 Login exitoso:', {
          hasToken: !!token,
          tokenLength: token?.length,
          user: user,
          userRole: user?.role,
        });
        
        if (token && user) {
          authUtils.setAuth(token, user);
          
          // Verificar que se guardó correctamente
          const savedToken = authUtils.getToken();
          console.log('✅ Token guardado:', {
            saved: !!savedToken,
            length: savedToken?.length,
          });

          // Redirigir según el rol
          if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          console.error('❌ No se recibió token o usuario del servidor');
          setError(t('login.authError'));
        }
        } else {
          console.error('❌ Error en login:', response.error);
          setError(response.error || t('login.error'));
        }
      } catch (err) {
        setError(t('login.connectionError'));
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
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo href="/" size="lg" />
              </div>
              <p className="text-gray-500 text-sm">{t('login.trustedPartner')}</p>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('login.title')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Username Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('login.usernameOrEmail')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('login.usernameOrEmailPlaceholder')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{t('login.usernameOrEmailHint')}</p>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('login.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-medium transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t('login.signingIn') : t('login.signIn')}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">o</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('login.noAccount')}{" "}
                <Link
                  href="/register"
                  className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
                >
                  {t('login.signUp')}
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <p className="mt-6 text-center text-xs text-gray-500">
            {t('login.acceptTerms')}{" "}
            <Link href="/terminos-condiciones" className="text-[var(--yass-gold)] hover:underline">
              {t('login.termsOfService')}
            </Link>{" "}
            {t('login.and')}{" "}
            <Link href="/politica-privacidad" className="text-[var(--yass-gold)] hover:underline">
              {t('login.privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
