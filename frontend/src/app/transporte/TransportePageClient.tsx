"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { transportsAPI, vehiclesAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { translateTransport } from "@/lib/translations/transportTranslations";
import { translateVehicle } from "@/lib/translations/vehicleTranslations";
import {
  Plane,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Car,
  Building2,
  Route,
  Heart
} from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";

interface Transport {
  _id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  priceLabel: string;
  route: {
    from: string;
    to: string;
  };
  active: boolean;
  featured?: boolean;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  capacity: {
    passengers: number;
    luggage?: string;
  };
  description: string;
  image: string;
  features: string[];
  active: boolean;
}

const iconMap: Record<string, any> = {
  plane: Plane,
  "map-pin": MapPin,
  clock: Clock,
  route: Route,
  car: Car,
  building: Building2,
};

const colorMap: Record<string, string> = {
  airport: "from-blue-500 to-cyan-500",
  intercity: "from-purple-500 to-pink-500",
  hourly: "from-green-500 to-emerald-500",
  custom: "from-orange-500 to-red-500",
};

export default function TransportePageClient() {
  const searchParams = useSearchParams();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingTransports, setLoadingTransports] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorTransports, setErrorTransports] = useState("");
  const [errorVehicles, setErrorVehicles] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState<Set<string>>(new Set());
  const [searchFilters, setSearchFilters] = useState({
    serviceType: searchParams?.get("serviceType") || "",
    from: searchParams?.get("from") || "",
    to: searchParams?.get("to") || "",
    date: searchParams?.get("date") || "",
    passengers: parseInt(searchParams?.get("passengers") || "1"),
  });
  const { t, formatPrice, language } = useI18n();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yassline.com";

  useSEO({
    title:
      "Servicios de Transporte Turístico en Marruecos | Traslados Aeropuerto 24/7 | Yassline Tour",
    description:
      "Servicios de transporte turístico premium en Marruecos: traslados aeropuerto 24/7, transporte interciudades, servicio por horas y transporte personalizado. Flota Mercedes-Benz (V-Class, Vito, Sprinter). Reserva ahora.",
    keywords: [
      "transporte turístico Marruecos",
      "traslado aeropuerto Marruecos 24 horas",
      "transporte interciudades Marruecos",
      "servicio transporte por horas Marruecos",
      "transporte personalizado Marruecos",
      "Mercedes transporte Marruecos",
      "transporte privado Marruecos",
      "chofer privado Marruecos",
      "transporte ejecutivo Marruecos",
      "alquiler vehículo con chofer Marruecos",
      "transporte VIP Marruecos",
      "traslados Casablanca",
      "traslados Marrakech",
      "traslados Tánger",
      "transporte Fez",
    ],
    url: "/transporte",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${baseUrl}/transporte#service`,
      serviceType: "Transportation Service",
      name: "Servicios de Transporte Turístico en Marruecos",
      description:
        "Servicios completos de transporte turístico premium en Marruecos con flota Mercedes-Benz",
      provider: {
        "@type": "TravelAgency",
        name: "Yassline Tour",
        "@id": `${baseUrl}#travelagency`,
      },
      areaServed: {
        "@type": "Country",
        name: "Morocco",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Transporte",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Traslado Aeropuerto",
              description:
                "Servicio de traslado desde y hacia aeropuertos en Marruecos disponible 24/7",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Transporte Interciudades",
              description: "Transporte entre ciudades principales de Marruecos",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Servicio por Horas",
              description:
                "Alquiler de vehículo con chofer por horas para tours personalizados",
            },
          },
        ],
      },
    },
  });

  const fetchData = useCallback(async () => {
    try {
      setLoadingTransports(true);
      setErrorTransports("");
      const transportsResponse = await transportsAPI.getAll();
      if (transportsResponse.success && transportsResponse.data) {
        let transportsData = Array.isArray(transportsResponse.data)
          ? transportsResponse.data
              .filter((t: Transport) => t.active)
              .map((t: Transport) =>
                translateTransport(t, language as "es" | "en" | "fr")
              )
          : [];

        if (
          searchFilters.serviceType ||
          searchFilters.from ||
          searchFilters.to
        ) {
          transportsData = transportsData.filter((transport: Transport) => {
            const matchesServiceType =
              !searchFilters.serviceType ||
              transport.type === searchFilters.serviceType;
            const matchesFrom =
              !searchFilters.from ||
              (transport.route?.from &&
                transport.route.from
                  .toLowerCase()
                  .includes(searchFilters.from.toLowerCase())) ||
              transport.name
                .toLowerCase()
                .includes(searchFilters.from.toLowerCase());
            const matchesTo =
              !searchFilters.to ||
              (transport.route?.to &&
                transport.route.to
                  .toLowerCase()
                  .includes(searchFilters.to.toLowerCase())) ||
              transport.name
                .toLowerCase()
                .includes(searchFilters.to.toLowerCase());
            return matchesServiceType && matchesFrom && matchesTo;
          });
        }

        setTransports(transportsData);
      } else {
        setErrorTransports(
          transportsResponse.error || t("transport.errorLoadingServices")
        );
      }
    } catch (err) {
      console.error("Error cargando transportes:", err);
      setErrorTransports(t("transport.errorLoadingServices"));
    } finally {
      setLoadingTransports(false);
    }

    try {
      setLoadingVehicles(true);
      setErrorVehicles("");
      const vehiclesResponse = await vehiclesAPI.getAll();
      if (vehiclesResponse.success && vehiclesResponse.data) {
        const vehiclesData = Array.isArray(vehiclesResponse.data)
          ? vehiclesResponse.data.filter((v: Vehicle) => v.active)
          : [];
        setVehicles(vehiclesData.slice(0, 3));
      } else {
        setErrorVehicles(
          vehiclesResponse.error || t("vehicles.errorLoading")
        );
      }
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      setErrorVehicles(t("vehicles.errorLoading"));
    } finally {
      setLoadingVehicles(false);
    }
  }, [t, language, searchFilters]);

  useEffect(() => {
    if (searchParams) {
      setSearchFilters({
        serviceType: searchParams.get("serviceType") || "",
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
        date: searchParams.get("date") || "",
        passengers: parseInt(searchParams.get("passengers") || "1"),
      });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      userAPI
        .getFavorites()
        .then((response) => {
          if (response.success && response.data) {
            const favSet = new Set<string>();
            (Array.isArray(response.data) ? response.data : []).forEach(
              (fav: any) => {
                if (fav.serviceType === "transport") {
                  favSet.add(fav.serviceId);
                }
              }
            );
            setFavorites(favSet);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleFavorite = useCallback(async (transport: Transport) => {
    if (!authUtils.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    const transportId = transport._id;
    const isFav = favorites.has(transportId);

    setFavoritesLoading((prev) => new Set(prev).add(transportId));

    try {
      if (isFav) {
        const favResponse = await userAPI.getFavorites();
        if (favResponse.success && favResponse.data) {
          const favs = Array.isArray(favResponse.data) ? favResponse.data : [];
          const favToRemove = favs.find(
            (f: any) =>
              f.serviceType === "transport" && f.serviceId === transportId
          );
          if (favToRemove) {
            await userAPI.removeFavorite(favToRemove._id);
            setFavorites((prev) => {
              const newSet = new Set(prev);
              newSet.delete(transportId);
              return newSet;
            });
          }
        }
      } else {
        await userAPI.addFavorite("transport", transportId);
        setFavorites((prev) => new Set(prev).add(transportId));
      }
    } catch (err) {
      console.error("Error al actualizar favorito:", err);
    } finally {
      setFavoritesLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transportId);
        return newSet;
      });
    }
  }, [favorites]);

  const translatedVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    return vehicles.map((v) =>
      translateVehicle(v, language as "es" | "en" | "fr")
    );
  }, [vehicles, language]);

  const getVehicleTypeLabel = (type: string): string => {
    switch (type) {
      case "v-class":
        return t("vehicles.vip");
      case "vito":
        return t("vehicles.family");
      case "sprinter":
        return t("vehicles.groups");
      case "other":
        return t("vehicles.others");
      default:
        return type.toUpperCase();
    }
  };

  const intercityService = useMemo(() => {
    return transports.find((t) => t.type === "intercity");
  }, [transports]);

  const popularRoutesBase = useMemo(
    () => [
      {
        id: "marrakech-casablanca",
        from: "Marrakech",
        to: "Casablanca",
        priceMAD: 1500,
        name: t("transport.interCity"),
      },
      {
        id: "tanger-chefchaouen",
        from: "Tánger",
        to: "Chefchaouen",
        priceMAD: 1078,
        name: t("transport.interCity"),
      },
      {
        id: "tanger-casablanca",
        from: "Tánger",
        to: "Casablanca",
        priceMAD: 1800,
        name: t("transport.interCity"),
      },
    ],
    [t]
  );

  const translatePriceLabel = useCallback(
    (priceLabel: string): string => {
      if (!priceLabel) return "";
      const fromText = t("common.from");
      const safeFromText =
        fromText && fromText !== "common.from" ? fromText : "Desde";
      if (priceLabel.includes("common.from")) {
        return priceLabel.replace(/common\.from/gi, safeFromText);
      }
      const desdeMatch = priceLabel.match(
        /(Desde|From|À partir de)\s*(\d+(?:[.,]\d+)?)\s*€/i
      );
      if (desdeMatch) {
        const priceInEUR = parseFloat(desdeMatch[2].replace(",", "."));
        const priceInMAD = priceInEUR * 10.87;
        return safeFromText + " " + formatPrice(priceInMAD);
      }
      if (priceLabel.match(/Desde\s*/i)) {
        return priceLabel.replace(/Desde\s*/i, safeFromText + " ");
      }
      if (priceLabel.match(/From\s*/i)) {
        return priceLabel.replace(/From\s*/i, safeFromText + " ");
      }
      if (priceLabel.match(/À partir de\s*/i)) {
        return priceLabel.replace(/À partir de\s*/i, safeFromText + " ");
      }
      return priceLabel;
    },
    [t, formatPrice]
  );

  const routes = useMemo(() => {
    const fromText = t("common.from");
    const safeFromText =
      fromText && fromText !== "common.from" ? fromText : "Desde";
    return popularRoutesBase.map((route) => ({
      ...route,
      _id: intercityService?._id || route.id,
      priceLabel: safeFromText + " " + formatPrice(route.priceMAD),
      route: {
        from: route.from,
        to: route.to,
      },
    }));
  }, [popularRoutesBase, intercityService, formatPrice, t]);

  const translatedTransports = useMemo(() => {
    return transports.map((transport) => ({
      ...transport,
      priceLabel: transport.priceLabel
        ? translatePriceLabel(transport.priceLabel)
        : transport.priceLabel,
    }));
  }, [transports, translatePriceLabel]);

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <StructuredData
        type="Service"
        data={{
          serviceType: "Transportation Service",
          provider: {
            "@type": "TravelAgency",
            name: "Yassline Tour",
          },
        }}
      />
      <Navbar />

      <section className="relative pt-24 pb-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-black)]/95 via-[var(--yass-black-soft)]/95 to-[var(--yass-gold)]/95"></div>
          <Image
            src="/img/v-class1.jpg"
            alt="Transporte VIP - Servicio de transporte turístico premium en Marruecos | Yassline Tour"
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--yass-gold)]/10 via-transparent to-[var(--yass-black)]/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yass-gold)]/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50"></div>
              <span className="text-xs font-bold text-white/95 uppercase tracking-widest bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-xl">
                {t("transport.premiumTransport")}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50"></div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                {t("transport.vipTransfers")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/95 mb-6 leading-relaxed drop-shadow-lg font-light max-w-3xl">
              {t("transport.heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-4 text-white/95">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl">
                <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                  <CheckCircle2 className="w-6 h-6 text-[var(--yass-gold)]" />
                </div>
                <span className="font-semibold text-base">
                  {t("transport.professionalDriver")}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl">
                <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                  <CheckCircle2 className="w-6 h-6 text-[var(--yass-gold)]" />
                </div>
                <span className="font-semibold text-base">
                  {t("transport.luxuryVehicles")}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl">
                <div className="w-10 h-10 rounded-lg bg-[var(--yass-gold)]/20 backdrop-blur-sm flex items-center justify-center border border-[var(--yass-gold)]/30">
                  <CheckCircle2 className="w-6 h-6 text-[var(--yass-gold)]" />
                </div>
                <span className="font-semibold text-base">
                  {t("transport.guaranteedPunctuality")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-20 w-96 h-96 bg-[var(--yass-gold)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-[var(--yass-gold)] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {(searchFilters.serviceType ||
            searchFilters.from ||
            searchFilters.to ||
            searchFilters.date) && (
            <div className="mb-8 p-4 bg-gradient-to-r from-[var(--yass-gold)]/10 to-[var(--yass-black)]/10 rounded-2xl border border-[var(--yass-gold)]/20">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">
                  {t("transport.searchResults")}
                </span>
                {searchFilters.serviceType && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                    {t("transport.selectServiceType")}:{" "}
                    <strong>
                      {searchFilters.serviceType === "airport"
                        ? t("transport.airport")
                        : searchFilters.serviceType === "intercity"
                        ? t("transport.interCity")
                        : searchFilters.serviceType === "hourly"
                        ? t("transport.hourly")
                        : searchFilters.serviceType === "custom"
                        ? t("transport.custom")
                        : searchFilters.serviceType}
                    </strong>
                  </span>
                )}
                {searchFilters.from && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                    {t("common.from")}: <strong>{searchFilters.from}</strong>
                  </span>
                )}
                {searchFilters.to && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                    {t("common.to")}: <strong>{searchFilters.to}</strong>
                  </span>
                )}
                {searchFilters.date && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                    {t("common.date")}:{" "}
                    <strong>
                      {(() => {
                        const date = new Date(
                          searchFilters.date + "T00:00:00"
                        );
                        const day = date
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = date.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </strong>
                  </span>
                )}
                {searchFilters.passengers > 1 && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                    {t("common.passengers")}:{" "}
                    <strong>{searchFilters.passengers}</strong>
                  </span>
                )}
                <Link
                  href="/transporte"
                  className="ml-auto px-4 py-1 bg-white rounded-lg text-sm font-semibold text-[var(--yass-gold)] hover:bg-[var(--yass-gold)] hover:text-white transition-colors"
                >
                  {t("common.clearFilters")}
                </Link>
              </div>
            </div>
          )}

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
              <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
                {t("transport.services")}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-[var(--yass-gold)] to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
              {t("transport.ourServices")}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("transport.servicesDescription")}
            </p>
          </div>

          {loadingTransports ? (
            <LoadingState message={t("transport.loadingServices")} />
          ) : errorTransports ? (
            <ErrorState
              title={t("transport.errorLoadingServices")}
              message={errorTransports}
            />
          ) : translatedTransports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {translatedTransports.map((transport, index) => {
                const IconComponent = iconMap[transport.icon] || Car;
                const color =
                  colorMap[transport.type] || "from-gray-500 to-gray-600";
                const isFavorite = favorites.has(transport._id);
                const isLoading = favoritesLoading.has(transport._id);

                const handleFavoriteClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(transport);
                };

                return (
                  <Link
                    key={transport._id}
                    href={`/transporte/${transport._id}`}
                    prefetch={false}
                    className="block"
                  >
                    <div
                      className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer group border border-gray-100/50 hover:border-[var(--yass-gold)]/30 relative overflow-hidden h-full"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-[var(--yass-gold)]/10 group-hover:via-transparent group-hover:to-[var(--yass-black)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {authUtils.isAuthenticated() && (
                        <button
                          onClick={handleFavoriteClick}
                          disabled={isLoading}
                          className={`absolute top-5 right-5 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 z-20 ${
                            isFavorite
                              ? "bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white shadow-lg shadow-[var(--yass-gold)]/30"
                              : "bg-white/95 text-gray-700 hover:bg-white border border-gray-200"
                          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={
                            isFavorite
                              ? t("favorites.remove")
                              : t("favorites.add")
                          }
                        >
                          <Heart
                            className={`w-5 h-5 ${isFavorite ? "fill-current" : ""} ${isLoading ? "animate-pulse" : ""}`}
                          />
                        </button>
                      )}

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-[var(--yass-gold)]/30 flex-shrink-0`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[var(--yass-gold)] transition-colors duration-300 leading-tight">
                          {transport.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 text-base flex-grow">
                          {transport.description}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                          {(transport.priceLabel ||
                            transport.type === "custom") && (
                            <div>
                              <p className="text-2xl font-extrabold bg-gradient-to-r from-[var(--yass-gold)] via-[var(--yass-gold-light)] to-[var(--yass-gold)] bg-clip-text text-transparent bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500">
                                {transport.type === "hourly"
                                  ? t("transport.fromHour", {
                                      price: formatPrice(
                                        transport.price || 187.5
                                      ).replace(/\.00/, ""),
                                    })
                                  : transport.type === "custom"
                                  ? t("transport.consultPrice")
                                  : transport.priceLabel}
                              </p>
                              {transport.type !== "custom" &&
                                transport.type !== "hourly" && (
                                  <p className="text-xs text-gray-500 mt-1 font-medium">
                                    {t("common.perPerson")}
                                  </p>
                                )}
                            </div>
                          )}
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[var(--yass-gold)] group-hover:to-[var(--yass-gold-light)] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-xl group-hover:shadow-[var(--yass-gold)]/30">
                            <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="route"
              message={t("transport.noServicesAvailable")}
            />
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--yass-gold)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--yass-gold)] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
              <span className="text-xs font-bold text-[var(--yass-gold)] uppercase tracking-widest bg-gradient-to-r from-[var(--yass-gold)]/10 via-[var(--yass-gold-light)]/10 to-[var(--yass-gold)]/10 px-6 py-2 rounded-full border-2 border-[var(--yass-gold)]/30 shadow-lg backdrop-blur-sm">
                {t("transport.routes")}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[var(--yass-gold)] to-[var(--yass-gold)]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-[var(--yass-gold)] to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
              {t("transport.popularRates")}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("transport.popularRatesDescription")}
            </p>
          </div>

          {routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.map((route, index) => {
                const routeIsFavorite = favorites.has(route._id);
                const routeIsLoading = favoritesLoading.has(route._id);

                const handleRouteFavoriteClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (authUtils.isAuthenticated() && intercityService) {
                    handleToggleFavorite(intercityService);
                  } else {
                    window.location.href = "/login";
                  }
                };

                return (
                  <div
                    key={route.id || `route-${index}`}
                    className="bg-white border-2 border-gray-200/50 rounded-3xl p-8 hover:border-[var(--yass-gold)]/50 transition-all duration-500 hover:shadow-2xl group transform hover:-translate-y-3 relative overflow-hidden shadow-lg hover:shadow-[var(--yass-gold)]/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--yass-gold)]/5 via-transparent to-[var(--yass-black)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {authUtils.isAuthenticated() && intercityService && (
                      <button
                        onClick={handleRouteFavoriteClick}
                        disabled={routeIsLoading}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-20 ${
                          routeIsFavorite
                            ? "bg-[var(--yass-gold)] text-white shadow-lg"
                            : "bg-white/90 text-gray-700 hover:bg-white"
                        } ${routeIsLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={
                          routeIsFavorite
                            ? t("favorites.remove")
                            : t("favorites.add")
                        }
                      >
                        <Heart
                          className={`w-5 h-5 ${routeIsFavorite ? "fill-current" : ""} ${routeIsLoading ? "animate-pulse" : ""}`}
                        />
                      </button>
                    )}

                    <Link
                      href={`/transporte/${route._id}`}
                      prefetch={false}
                      className="block"
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yass-black)] to-[var(--yass-gold)] flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-gray-900 text-lg">
                                {route.route.from}
                              </span>
                            </div>
                            <div className="flex justify-center my-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--yass-black)] via-[var(--yass-gold)] to-[var(--yass-gold-light)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                                <ArrowRight className="w-7 h-7 text-white" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 group-hover:from-pink-100 group-hover:to-pink-200 transition-all duration-300 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-gray-900 text-lg">
                                {route.route.to}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {t("transport.service")}:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {route.name}
                            </span>
                          </div>
                          {route.priceLabel && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <span className="text-3xl font-extrabold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
                                {route.priceLabel}
                              </span>
                            </div>
                          )}
                          <div className="w-full mt-6 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 text-center group-hover:scale-105 group-hover:from-[var(--yass-gold-light)] group-hover:to-[var(--yass-gold)]">
                            {t("transport.viewDetailsAndBook")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {t("transport.noRoutesAvailable")}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("vehicles.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              {t("vehicles.subtitle")}
            </p>
            <Link
              href="/vehiculos"
              prefetch={false}
              className="text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold inline-flex items-center gap-2 transition-colors"
            >
              {t("vehicles.viewAllVehicles")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingVehicles ? (
            <LoadingState message={t("vehicles.loading")} />
          ) : errorVehicles ? (
            <ErrorState
              title={t("vehicles.errorLoading")}
              message={errorVehicles}
            />
          ) : translatedVehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {translatedVehicles.map((vehicle) => (
                  <Link
                    key={`${vehicle._id}-${language}`}
                    href="/vehiculos"
                    prefetch={false}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      <Image
                        src={vehicle.image || "/img/v-class1.jpg"}
                        alt={`${vehicle.name} - Vehículo Mercedes-Benz para transporte turístico en Marruecos | Yassline Tour`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                          {(() => {
                            const VehicleIcon = getVehicleIcon(vehicle.type);
                            return (
                              <>
                                <VehicleIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                {getVehicleTypeLabel(vehicle.type)}
                              </>
                            );
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {vehicle.name}
                      </h3>
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                        {vehicle.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {(() => {
                          const VehicleIcon = getVehicleIcon(vehicle.type);
                          return <VehicleIcon className="w-4 h-4" />;
                        })()}
                        <span>
                          {vehicle.capacity?.passengers || 0}{" "}
                          {t("vehicles.seats")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {translatedVehicles.length >= 3 && (
                <div className="text-center mt-8">
                  <Link
                    href="/vehiculos"
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
                  >
                    {t("vehicles.viewAllVehicles")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon="car"
              message={t("vehicles.noVehicles")}
            />
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--yass-black)] to-[var(--yass-gold)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("transport.needCustomRoute")}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t("transport.contactForQuote")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="bg-white text-[var(--yass-gold)] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors text-center"
            >
              {t("transport.requestQuote")}
            </Link>
            <Link
              href="/contacto"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors text-center"
            >
              {t("contact.title")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
