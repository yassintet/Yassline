"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { searchAPI } from "@/lib/api";
import { Search, Loader2, AlertCircle, MapPin, Route, Car } from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

export default function BuscarPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [type, setType] = useState(searchParams?.get("type") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>({
    transports: [],
    circuits: [],
    vehicles: [],
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.length < 2) {
      setResults({ transports: [], circuits: [], vehicles: [] });
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await searchAPI.global(query, type || undefined);
      if (response.success && response.data) {
        const searchData = response.data as any;
        setResults(searchData || { transports: [], circuits: [], vehicles: [] });
      } else {
        setError(response.error || t("search.error"));
      }
    } catch (err: any) {
      console.error("Error buscando:", err);
      setError(err.message || t("search.error"));
    } finally {
      setLoading(false);
    }
  }, [query, type, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query && query.length >= 2) {
        handleSearch();
      } else if (query.length === 0) {
        setResults({ transports: [], circuits: [], vehicles: [] });
        setError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, type, handleSearch]);

  const totalResults =
    results.transports.length + results.circuits.length + results.vehicles.length;

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t("search.title")}
          </h1>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t("search.placeholder")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none"
              >
                <option value="">{t("search.allTypes")}</option>
                <option value="transport">{t("search.transport")}</option>
                <option value="circuit">{t("search.circuit")}</option>
                <option value="vehicle">{t("search.vehicle")}</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-[var(--yass-gold)] text-white rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("search.searching")}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    {t("search.search")}
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading && query.length >= 2 ? (
            <LoadingState />
          ) : query && query.length >= 2 ? (
            totalResults === 0 ? (
              <EmptyState
                icon="alert"
                title={t("search.noResults")}
                message={t("search.noResultsMessage")}
              />
            ) : (
              <div className="space-y-8">
                {results.transports.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Route className="h-6 w-6 text-[var(--yass-gold)]" />
                      {t("search.transports")} ({results.transports.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.transports.map((transport: any) => (
                        <Link
                          key={transport._id}
                          href="/transporte"
                          className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100 hover:shadow-lg transition-all"
                        >
                          <h3 className="font-bold text-gray-900 mb-2">
                            {transport.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {transport.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.circuits.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-[var(--yass-gold)]" />
                      {t("search.circuits")} ({results.circuits.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.circuits.map((circuit: any) => (
                        <Link
                          key={circuit._id}
                          href={`/circuitos/${circuit.slug}`}
                          className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100 hover:shadow-lg transition-all"
                        >
                          <h3 className="font-bold text-gray-900 mb-2">
                            {circuit.name || circuit.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {circuit.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.vehicles.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="h-6 w-6 text-[var(--yass-gold)]" />
                      {t("search.vehicles")} ({results.vehicles.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.vehicles.map((vehicle: any) => {
                        const VehicleIcon = getVehicleIcon(vehicle.type);
                        return (
                          <div
                            key={vehicle._id}
                            className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <VehicleIcon className="h-5 w-5 text-[var(--yass-gold)]" strokeWidth={2} />
                              <span className="text-xs font-semibold uppercase text-gray-500">{vehicle.type}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">
                              {vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {vehicle.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <EmptyState
              icon="alert"
              title={t("search.startSearch")}
              message={t("search.startSearchMessage")}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
