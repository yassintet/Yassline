"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { transportsAPI } from "@/lib/api";

interface Transport {
  _id?: string;
  type?: string;
  name?: string;
  description?: string;
  icon?: string;
  price?: number;
  priceLabel?: string;
  route?: {
    from?: string;
    to?: string;
  };
  active?: boolean;
}

export default function EditarTransporte() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "airport",
    name: "",
    description: "",
    icon: "car",
    price: "",
    priceLabel: "",
    route: {
      from: "",
      to: "",
    },
    active: true,
  });

  const loadTransport = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError("");
      const response = await transportsAPI.getById(id);

      if (response.success && response.data) {
        const transport = response.data as Transport;
        setFormData({
          type: transport.type || "airport",
          name: transport.name || "",
          description: transport.description || "",
          icon: transport.icon || "car",
          price: transport.price?.toString() || "",
          priceLabel: transport.priceLabel || "",
          route: {
            from: transport.route?.from || "",
            to: transport.route?.to || "",
          },
          active: transport.active !== undefined ? transport.active : true,
        });
      } else {
        setError("Error al cargar el transporte");
      }
    } catch (err) {
      setError("Error al cargar el transporte");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authUtils.isAuthenticated() || !authUtils.isAdmin()) {
      router.push('/login');
      return;
    }

    if (id) {
      loadTransport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
      };

      const response = await transportsAPI.update(id, data);

      if (response.success) {
        router.push('/admin');
      } else {
        setError(response.error || "Error al actualizar el transporte");
      }
    } catch (err) {
      setError("Error al actualizar el transporte");
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Transporte</h1>

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
                  Tipo *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                >
                  <option value="airport">Aeropuerto</option>
                  <option value="intercity">Interciudades</option>
                  <option value="hourly">Por Horas</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (€)
                </label>
                <input
                  type="number"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <input
                  type="text"
                  value={formData.route.from}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    route: { ...formData.route, from: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <input
                  type="text"
                  value={formData.route.to}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    route: { ...formData.route, to: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
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
