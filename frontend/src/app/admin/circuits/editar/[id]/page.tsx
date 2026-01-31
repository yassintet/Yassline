"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { circuitsAPI } from "@/lib/api";

interface Circuit {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  duration?: string;
  price?: number;
  priceLabel?: string;
  image?: string;
  featured?: boolean;
  active?: boolean;
}

export default function EditarCircuito() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    duration: "",
    price: "",
    priceLabel: "",
    image: "",
    featured: false,
    active: true,
  });

  useEffect(() => {
    // Verificar autenticación una sola vez al montar
    if (!authUtils.isAuthenticated() || !authUtils.isAdmin()) {
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCircuit = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError("");
      const response = await circuitsAPI.getById(id);

      if (response.success && response.data) {
        const circuit = response.data as Circuit;
        setFormData({
          name: circuit.name || "",
          title: circuit.title || "",
          description: circuit.description || "",
          duration: circuit.duration || "",
          price: circuit.price?.toString() || "",
          priceLabel: circuit.priceLabel || "",
          image: circuit.image || "",
          featured: circuit.featured || false,
          active: circuit.active !== undefined ? circuit.active : true,
        });
      } else {
        setError("Error al cargar el circuito");
      }
    } catch (err) {
      setError("Error al cargar el circuito");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Solo cargar el circuito si el usuario está autenticado y hay un ID válido
    if (authUtils.isAuthenticated() && authUtils.isAdmin() && id) {
      loadCircuit();
    }
  }, [id, loadCircuit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      const response = await circuitsAPI.update(id, data);

      if (response.success) {
        router.push('/admin');
      } else {
        setError(response.error || "Error al actualizar el circuito");
      }
    } catch (err) {
      setError("Error al actualizar el circuito");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--yass-gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--yass-gold)] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Circuito</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración *
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (€) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiqueta de Precio
                </label>
                <input
                  type="text"
                  value={formData.priceLabel}
                  onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen *
              </label>
              <input
                type="text"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-[var(--yass-gold)] border-gray-300 rounded focus:ring-[var(--yass-gold)]"
                />
                <span className="text-sm text-gray-700">Destacado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-[var(--yass-gold)] border-gray-300 rounded focus:ring-[var(--yass-gold)]"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[var(--yass-gold)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--yass-gold-light)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
