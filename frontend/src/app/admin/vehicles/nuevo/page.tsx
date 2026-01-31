"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, X } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { vehiclesAPI } from "@/lib/api";

export default function NuevoVehiculo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "v-class",
    capacity: {
      passengers: "",
      luggage: "",
    },
    description: "",
    image: "",
    features: [] as string[],
    active: true,
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (!authUtils.isAuthenticated() || !authUtils.isAdmin()) {
      router.push('/login');
    }
  }, [router]);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        capacity: {
          passengers: parseInt(formData.capacity.passengers) || 0,
          luggage: formData.capacity.luggage,
        },
      };

      const response = await vehiclesAPI.create(data);

      if (response.success) {
        router.push('/admin');
      } else {
        setError(response.error || "Error al crear el vehículo");
      }
    } catch (err) {
      setError("Error al crear el vehículo");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Vehículo</h1>

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
                  placeholder="Ej: Mercedes V-Class"
                />
              </div>

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
                  <option value="v-class">V-Class</option>
                  <option value="vito">Vito</option>
                  <option value="sprinter">Sprinter</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                placeholder="Descripción del vehículo..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad de Pasajeros *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity.passengers}
                  onChange={(e) => setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, passengers: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad de Equipaje
                </label>
                <input
                  type="text"
                  value={formData.capacity.luggage}
                  onChange={(e) => setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, luggage: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                  placeholder="Ej: 2 maletas grandes"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                placeholder="/img/v-class1.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-transparent outline-none"
                  placeholder="Ej: WiFi gratuito"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
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
                disabled={loading}
                className="bg-[var(--yass-gold)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--yass-gold-light)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Vehículo
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
