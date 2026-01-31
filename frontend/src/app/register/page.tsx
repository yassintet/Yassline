"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones del frontend (coinciden con el backend)
    if (!formData.username || formData.username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    if (formData.username.length > 30) {
      setError("El nombre de usuario no puede tener más de 30 caracteres");
      return;
    }

    // Validar que el username solo contenga letras minúsculas, números y guiones bajos
    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      setError("El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos (_)");
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError("Email inválido");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Convertir username a minúsculas antes de enviar
      const usernameLower = formData.username.toLowerCase().trim();
      
      const response = await authAPI.register(
        usernameLower,
        formData.email.trim(),
        formData.password
      );

      if (response.success && response.data) {
        // Guardar token y usuario
        const authData = response.data as { token?: string; user?: any };
        const { token, user } = authData;
        
        if (token && user) {
          authUtils.setAuth(token, user);

          // Redirigir según el rol
          if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          setError(t('register.authError'));
        }
      } else {
        // Mostrar errores de validación si existen
        let errorMessage = response.error || response.message || t('register.error');
        
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          const errorMessages = response.errors.map((err: any) => {
            if (typeof err === 'string') return err;
            return err.msg || err.message || JSON.stringify(err);
          });
          errorMessage = errorMessages.join(', ');
        }
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error en registro:', err);
      setError(err.message || t('register.connectionError'));
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
          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo href="/" size="lg" />
              </div>
              <p className="text-gray-500 text-sm">Únete a nuestra comunidad</p>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Crear cuenta
              </h2>
              <p className="text-gray-600 text-sm">
                Regístrate para acceder a todas las funcionalidades
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
              {/* Username Input */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('register.username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      // Convertir a minúsculas automáticamente y permitir solo letras, números y guiones bajos
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setFormData({ ...formData, username: value });
                    }}
                    required
                    disabled={loading}
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9_]+"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="usuario123"
                    title="Solo letras minúsculas, números y guiones bajos (_). Mínimo 3 caracteres."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Solo letras minúsculas, números y guiones bajos (_). Entre 3 y 30 caracteres.
                </p>
                {formData.username && formData.username.length > 0 && (
                  <p className="mt-1 text-xs">
                    {formData.username.length < 3 ? (
                      <span className="text-red-500">⚠️ Mínimo 3 caracteres</span>
                    ) : formData.username.length > 30 ? (
                      <span className="text-red-500">⚠️ Máximo 30 caracteres</span>
                    ) : !/^[a-z0-9_]+$/.test(formData.username) ? (
                      <span className="text-red-500">⚠️ Solo letras minúsculas, números y _</span>
                    ) : (
                      <span className="text-green-600">✓ Usuario válido</span>
                    )}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('register.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('register.emailPlaceholder')}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('register.passwordPlaceholder')}
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
                <p className="mt-1 text-xs text-gray-500">{t('register.passwordHint')}</p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('register.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('register.passwordPlaceholder')}
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
                {formData.password && formData.confirmPassword && (
                  <div className="mt-1 flex items-center gap-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-green-600">{t('register.passwordsMatch')}</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-xs text-red-600">{t('register.passwordsNotMatch')}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? t('register.createAccount') : t('register.signUp')}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">{t('register.divider')}</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('register.alreadyHaveAccount')}{" "}
                <Link
                  href="/login"
                  className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
                >
                  {t('register.signIn')}
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <p className="mt-6 text-center text-xs text-gray-500">
            {t('register.acceptTerms')}{" "}
            <Link href="/terminos-condiciones" className="text-[var(--yass-gold)] hover:underline">
              {t('register.termsOfService')}
            </Link>{" "}
            {t('register.and')}{" "}
            <Link href="/politica-privacidad" className="text-[var(--yass-gold)] hover:underline">
              {t('register.privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
