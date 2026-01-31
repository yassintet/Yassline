"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { transportsAPI, vehiclesAPI, userAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { translateTransport } from "@/lib/translations/transportTranslations";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  ArrowLeft,
  Plane,
  MapPin,
  Clock,
  Route,
  Car,
  CheckCircle2,
  ArrowRight,
  Heart,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { calculateDistance, calculateIntercityPrice } from "@/lib/distance";

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
}

// Mapeo de iconos
const iconMap: Record<string, any> = {
  plane: Plane,
  'map-pin': MapPin,
  clock: Clock,
  route: Route,
  car: Car,
};

// Colores por tipo de servicio
const colorMap: Record<string, string> = {
  airport: "from-blue-500 to-cyan-500",
  intercity: "from-purple-500 to-pink-500",
  hourly: "from-green-500 to-emerald-500",
  custom: "from-orange-500 to-red-500",
};

// Etiquetas de tipo - ahora se usan traducciones dinámicas

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Detectar ID de forma estable (evitar cambios durante el render)
  const getInitialId = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathId = pathname.split('/transporte/')[1]?.split('/')[0]?.split('?')[0];
      const paramId = params?.id as string;
      const finalId = paramId || pathId || '';
      
      // Filtrar placeholder y valores inválidos
      if (finalId && 
          finalId !== '__placeholder__' && 
          finalId !== 'undefined' && 
          finalId !== 'null' &&
          finalId.length > 0) {
        return finalId;
      }
    }
    
    // Fallback: usar params si está disponible
    const paramId = params?.id as string;
    if (paramId && 
        paramId !== '__placeholder__' && 
        paramId !== 'undefined' && 
        paramId !== 'null' &&
        paramId.length > 0) {
      return paramId;
    }
    
    return '';
  };
  
  // Estado para el id (inicializado de forma estable, solo una vez)
  const [currentId] = useState<string>(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      return getInitialId();
    }
    // En el servidor, usar params directamente
    const paramId = params?.id as string;
    return (paramId && paramId !== '__placeholder__') ? paramId : '';
  });
  
  // ID final (estable durante todo el render)
  const id = currentId || (params?.id as string) || '';
  
  const [transport, setTransport] = useState<Transport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [route, setRoute] = useState({
    from: "",
    to: "",
  });
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedPassengers, setSelectedPassengers] = useState<number>(1);
  const [passengersInput, setPassengersInput] = useState<string>("1"); // Estado temporal para el input
  const [airportPassengersInput, setAirportPassengersInput] = useState<string>("1"); // Estado temporal para aeropuerto
  const [customPassengersInput, setCustomPassengersInput] = useState<string>("1"); // Estado temporal para servicio personalizado
  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Lista de aeropuertos internacionales de Marruecos - memoizada
  const moroccanAirports = useMemo(() => [
    { code: "CMN", name: "Casablanca - Aeropuerto Internacional Mohammed V", city: "Casablanca", cityAliases: ["casablanca", "casa"] },
    { code: "RAK", name: "Marrakech - Aeropuerto Menara", city: "Marrakech", cityAliases: ["marrakech", "marrakesh"] },
    { code: "AGA", name: "Agadir - Aeropuerto Al Massira", city: "Agadir", cityAliases: ["agadir"] },
    { code: "TNG", name: "Tánger - Aeropuerto Ibn Battuta", city: "Tánger", cityAliases: ["tanger", "tánger", "tangier"] },
    { code: "TTU", name: "Tetouan - Aeropuerto Sania Ramel", city: "Tetouan", cityAliases: ["tetouan", "tetuan"] },
    { code: "FEZ", name: "Fez - Aeropuerto Saïss", city: "Fez", cityAliases: ["fez", "fes"] },
    { code: "RBA", name: "Rabat - Aeropuerto Salé", city: "Rabat", cityAliases: ["rabat", "sale", "salé"] },
    { code: "OUD", name: "Oujda - Aeropuerto Angads", city: "Oujda", cityAliases: ["oujda", "oujda"] },
    { code: "NDR", name: "Nador - Aeropuerto Al Aroui", city: "Nador", cityAliases: ["nador"] },
    { code: "ESU", name: "Essaouira - Aeropuerto Mogador", city: "Essaouira", cityAliases: ["essaouira", "mogador"] },
    { code: "OZZ", name: "Ouarzazate - Aeropuerto", city: "Ouarzazate", cityAliases: ["ouarzazate", "ouarzazat"] },
    { code: "VIL", name: "Dakhla - Aeropuerto", city: "Dakhla", cityAliases: ["dakhla"] },
    { code: "EUN", name: "Laayoune - Aeropuerto Hassan I", city: "Laayoune", cityAliases: ["laayoune", "el aaiún"] },
  ], []);

  // Precio fijo para traslado aeropuerto a su ciudad (40€ = ~435 MAD al cambio actual)
  const AIRPORT_CITY_PRICE = 435; // 40€ en MAD (aproximado)
  const AIRPORT_SUPPLEMENT = 54; // 5€ en MAD (aproximado)

  const [airportServiceData, setAirportServiceData] = useState({
    direction: "from", // "from" = desde aeropuerto, "to" = hacia aeropuerto
    airport: "", // Código del aeropuerto seleccionado
    vehicleType: "",
    passengers: 1,
    flightDate: "",
    flightTime: "",
    flightNumber: "",
    destination: "", // Dirección específica (hotel, dirección, etc.)
    luggage: "",
    specialRequirements: "",
  });
  const [airportCalculatedPrice, setAirportCalculatedPrice] = useState<number | null>(null);
  const [airportCalculatingPrice, setAirportCalculatingPrice] = useState(false);
  const [customServiceData, setCustomServiceData] = useState({
    description: "",
    vehicleType: "",
    passengers: 1,
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    specialRequirements: "",
  });
  const { t, formatPrice, convertPrice, language } = useI18n();
  
  // Precios por hora según tipo de vehículo (MAD/hora) - memoizado
  const hourlyRates = useMemo<Record<string, number>>(() => ({
    'vito': 187.5,
    'v-class': 250,
    'sprinter': 275,
  }), []);

  const fetchTransport = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await transportsAPI.getById(id);
      
      if (response.success && response.data) {
        const transportData = response.data as Transport;
        setTransport(transportData);
        // Inicializar ruta vacía para inter-ciudades (sin valores por defecto)
        // Solo inicializar si NO es intercity
        if (transportData.type !== 'intercity' && transportData.route) {
          setRoute({
            from: transportData.route.from || "",
            to: transportData.route.to || "",
          });
        } else if (transportData.type === 'intercity') {
          // Para inter-ciudades, dejar campos vacíos
          setRoute({
            from: "",
            to: "",
          });
        }
      } else {
        setError(response.error || t('errors.serviceNotFound'));
      }
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  // Cargar datos cuando el id esté disponible
  useEffect(() => {
    if (id && id.length > 0 && id !== '__placeholder__') {
      fetchTransport();
    }
  }, [id, fetchTransport]);

  // Cargar datos de búsqueda guardados desde localStorage y URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Leer datos de localStorage
    const savedBookingData = localStorage.getItem('bookingData');
    const savedSearchData = localStorage.getItem('searchFormData');
    
    // Leer parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlFrom = urlParams.get('from');
    const urlTo = urlParams.get('to');
    const urlDate = urlParams.get('date');
    const urlPassengers = urlParams.get('passengers');
    const urlServiceType = urlParams.get('serviceType');
    const urlVehicleType = urlParams.get('vehicleType');

    // Priorizar datos de localStorage, luego URL params
    let searchData: any = {};
    if (savedBookingData) {
      try {
        searchData = JSON.parse(savedBookingData);
      } catch (e) {
        console.error('Error parsing bookingData:', e);
      }
    } else if (savedSearchData) {
      try {
        searchData = JSON.parse(savedSearchData);
      } catch (e) {
        console.error('Error parsing searchFormData:', e);
      }
    }

    // Aplicar datos de URL si existen
    if (urlFrom) searchData.from = urlFrom;
    if (urlTo) searchData.to = urlTo;
    if (urlDate) searchData.date = urlDate;
    if (urlPassengers) searchData.passengers = parseInt(urlPassengers) || 1;
    if (urlServiceType) searchData.serviceType = urlServiceType;
    if (urlVehicleType) searchData.vehicleType = urlVehicleType;

    // Función para obtener el código de aeropuerto de una ciudad
    const getAirportCodeForCity = (city: string): string | null => {
      if (!city) return null;
      const cityLower = city.toLowerCase().trim();
      
      // Primero intentar buscar por código de aeropuerto en el texto (ej: "RAK", "CMN")
      const airportByCode = moroccanAirports.find(airport => 
        cityLower.includes(`(${airport.code.toLowerCase()})`) || 
        cityLower.includes(airport.code.toLowerCase())
      );
      if (airportByCode) return airportByCode.code;
      
      // Buscar coincidencias en cityAliases o nombre de ciudad
      const airport = moroccanAirports.find(airport => {
        // Verificar si el texto contiene el nombre de la ciudad o sus alias
        const cityMatches = airport.cityAliases.some(alias => 
          cityLower.includes(alias) || alias.includes(cityLower.split(' ')[0])
        ) || airport.city.toLowerCase().includes(cityLower.split(' ')[0]) ||
        cityLower.includes(airport.city.toLowerCase());
        
        // También verificar si contiene el nombre del aeropuerto
        const airportNameMatch = airport.name.toLowerCase().includes(cityLower.split(' ')[0]) ||
          cityLower.includes(airport.name.toLowerCase().split(' ')[0]);
        
        return cityMatches || airportNameMatch;
      });
      
      return airport ? airport.code : null;
    };

    // Función para extraer solo el nombre de la ciudad (sin aeropuerto)
    const extractCityName = (input: string): string => {
      if (!input) return '';
      
      // Buscar el aeropuerto correspondiente
      const airport = moroccanAirports.find(airport => {
        const inputLower = input.toLowerCase();
        return airport.cityAliases.some(alias => inputLower.includes(alias)) ||
               inputLower.includes(airport.city.toLowerCase()) ||
               airport.name.toLowerCase().includes(inputLower.split(' ')[0]);
      });
      
      // Si se encuentra un aeropuerto, devolver solo el nombre de la ciudad
      if (airport) {
        return airport.city;
      }
      
      // Si no se encuentra, devolver el input original pero limpiado
      // Remover referencias comunes a aeropuerto
      return input
        .replace(/\s*-\s*Aeropuerto.*/i, '')
        .replace(/\s*\([A-Z]{3}\)\s*/g, '')
        .trim();
    };

    // Auto-rellenar campos según el tipo de servicio
    if (transport && searchData) {
      if (transport.type === 'airport') {
        // Determinar qué campo contiene el aeropuerto
        const fromHasAirport = searchData.from && getAirportCodeForCity(searchData.from);
        const toHasAirport = searchData.to && getAirportCodeForCity(searchData.to);
        
        let airportCode: string | null = null;
        let destinationCity: string = '';
        let direction: "from" | "to" = "from";
        
        if (fromHasAirport) {
          // El campo "from" contiene el aeropuerto, entonces es "Desde Aeropuerto"
          airportCode = getAirportCodeForCity(searchData.from);
          direction = "from";
          // El destino es el campo "to" (si existe) o extraer la ciudad del campo "from"
          destinationCity = searchData.to ? extractCityName(searchData.to) : extractCityName(searchData.from);
        } else if (toHasAirport) {
          // El campo "to" contiene el aeropuerto, entonces es "Hacia Aeropuerto"
          airportCode = getAirportCodeForCity(searchData.to);
          direction = "to";
          // El destino es el campo "from" (origen de la ciudad)
          destinationCity = searchData.from ? extractCityName(searchData.from) : '';
        } else if (searchData.from) {
          // Si no se detecta aeropuerto pero hay datos, intentar detectar desde "from"
          airportCode = getAirportCodeForCity(searchData.from);
          destinationCity = searchData.to ? extractCityName(searchData.to) : extractCityName(searchData.from);
        }
        
        if (searchData.from || searchData.to) {
          setAirportServiceData(prev => ({
            ...prev,
            direction: direction,
            destination: destinationCity || prev.destination,
            passengers: searchData.passengers || prev.passengers,
            flightDate: searchData.date || prev.flightDate,
            vehicleType: searchData.vehicleType || prev.vehicleType,
            airport: airportCode || prev.airport,
          }));
          
          // Establecer también el vehículo seleccionado si hay vehicleType
          if (searchData.vehicleType) {
            setSelectedVehicle(searchData.vehicleType);
          }
        }
      } else if (transport.type === 'intercity') {
        // Para inter-ciudades, usar from y to
        if (searchData.from || searchData.to) {
          setRoute({
            from: searchData.from || '',
            to: searchData.to || '',
          });
          setSelectedPassengers(searchData.passengers || selectedPassengers);
          
          // Establecer también el vehículo seleccionado si hay vehicleType
          if (searchData.vehicleType) {
            setSelectedVehicle(searchData.vehicleType);
          }
        }
      } else if (transport.type === 'hourly') {
        // Para servicio por horas, usar from como origen
        if (searchData.from) {
          setRoute({
            from: searchData.from,
            to: '',
          });
          setSelectedPassengers(searchData.passengers || selectedPassengers);
        }
      } else if (transport.type === 'custom') {
        // Para servicio personalizado
        if (searchData.from) {
          setCustomServiceData(prev => ({
            ...prev,
            origin: searchData.from,
            passengers: searchData.passengers || prev.passengers,
            startDate: searchData.date || prev.startDate,
          }));
        }
      }
    }
  }, [transport, selectedPassengers]);

  // Cargar vehículos cuando el transporte esté disponible y sea necesario
  const fetchVehicles = useCallback(async () => {
    if (!transport || !['intercity', 'hourly', 'custom', 'airport'].includes(transport.type)) {
      return;
    }

    try {
      const response = await vehiclesAPI.getAll();
      if (response.success && response.data) {
        const vehiclesData = Array.isArray(response.data) 
          ? response.data.filter((v: any) => v.active && ['vito', 'v-class', 'sprinter'].includes(v.type))
          : [];
        setVehicles(vehiclesData);
        // Seleccionar el primer vehículo por defecto solo para intercity y hourly
        // Pero solo si no hay datos de búsqueda guardados con un vehicleType
        const savedSearchData = typeof window !== 'undefined' ? localStorage.getItem('searchFormData') : null;
        let hasSearchVehicleType = false;
        if (savedSearchData) {
          try {
            const parsed = JSON.parse(savedSearchData);
            hasSearchVehicleType = parsed.vehicleType && parsed.vehicleType !== '';
          } catch (e) {
            // Ignorar errores de parsing
          }
        }
        
        // Solo establecer el primer vehículo si no hay uno seleccionado Y no hay datos de búsqueda guardados
        // Verificar también los parámetros de URL para vehicleType
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const urlVehicleType = urlParams?.get('vehicleType');
        const hasVehicleTypeFromSearch = hasSearchVehicleType || (urlVehicleType && urlVehicleType !== '');
        
        if (vehiclesData.length > 0 && !selectedVehicle && transport.type !== 'custom' && !hasVehicleTypeFromSearch) {
          const firstVehicle = vehiclesData[0];
          setSelectedVehicle(firstVehicle.type);
          const maxPassengers = firstVehicle.capacity?.passengers || 7;
          const finalPassengers = Math.min(selectedPassengers, maxPassengers);
          setSelectedPassengers(finalPassengers);
          setPassengersInput(finalPassengers.toString());
        }
      }
    } catch (err) {
      console.error("Error cargando vehículos:", err);
    }
  }, [transport, selectedVehicle]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Sincronizar passengersInput con selectedPassengers cuando cambia desde otras fuentes
  useEffect(() => {
    setPassengersInput(selectedPassengers.toString());
  }, [selectedPassengers]);

  // Calcular distancia y precio cuando cambia la ruta y es servicio inter-ciudades
  useEffect(() => {
    if (!transport) return;
    
    const isIntercity = transport.type === "intercity";
    
    const calculateRouteDistance = async () => {
      if (!isIntercity || !route.from || !route.to) {
        setCalculatedDistance(null);
        setCalculatedPrice(null);
        return;
      }

      setCalculatingDistance(true);
      try {
        // Verificar si alguno de los campos contiene un aeropuerto
        // Buscar por la palabra "aeropuerto" primero (más específico)
        const fromHasAirport = route.from.toLowerCase().includes('aeropuerto') ||
          moroccanAirports.some(airport => {
            const fromLower = route.from.toLowerCase();
            return airport.cityAliases.some(alias => fromLower.includes(alias)) &&
                   (fromLower.includes('aeropuerto') || fromLower.includes(airport.code.toLowerCase()));
          });
        const toHasAirport = route.to.toLowerCase().includes('aeropuerto') ||
          moroccanAirports.some(airport => {
            const toLower = route.to.toLowerCase();
            return airport.cityAliases.some(alias => toLower.includes(alias)) &&
                   (toLower.includes('aeropuerto') || toLower.includes(airport.code.toLowerCase()));
          });
        const hasAirportInRoute = fromHasAirport || toHasAirport;

        const result = await calculateDistance(
          route.from, 
          route.to, 
          selectedVehicle || undefined,
          selectedPassengers || undefined
        );
        if (result !== null) {
          setCalculatedDistance(result.distance);
          // Si hay aeropuerto en la ruta, agregar suplemento de aeropuerto (5€ = 54 MAD)
          const finalPrice = hasAirportInRoute 
            ? result.price + AIRPORT_SUPPLEMENT 
            : result.price;
          setCalculatedPrice(Math.round(finalPrice * 100) / 100);
        } else {
          setCalculatedDistance(null);
          setCalculatedPrice(null);
        }
      } catch (error) {
        console.error("Error calculando distancia:", error);
        setCalculatedDistance(null);
        setCalculatedPrice(null);
      } finally {
        setCalculatingDistance(false);
      }
    };

    // Debounce para evitar múltiples llamadas mientras el usuario escribe
    const timeoutId = setTimeout(() => {
      calculateRouteDistance();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [route.from, route.to, transport, selectedVehicle, selectedPassengers, moroccanAirports]);

  // Calcular precio para servicio por horas - memoizado
  const hourlyPrice = useMemo(() => {
    if (!transport || transport.type !== "hourly") {
      return null;
    }

    if (selectedVehicle && selectedHours > 0) {
      const ratePerHour = hourlyRates[selectedVehicle] || 187.5;
      let basePrice = ratePerHour * selectedHours;
      
      // Aplicar suplementos según horas contratadas
      if (selectedHours >= 1 && selectedHours <= 2) {
        // Suplemento del 30% para 1-2 horas
        basePrice = basePrice * 1.30;
      } else if (selectedHours >= 3 && selectedHours <= 4) {
        // Suplemento del 20% para 3-4 horas
        basePrice = basePrice * 1.20;
      }
      // 5+ horas: sin suplemento (precio base)
      
      return Math.round(basePrice * 100) / 100;
    }
    return null;
  }, [selectedVehicle, selectedHours, transport, hourlyRates]);

  useEffect(() => {
    if (transport?.type === "hourly") {
      setCalculatedPrice(hourlyPrice);
    }
  }, [hourlyPrice, transport]);

  // Calcular precio para servicio de aeropuerto - optimizado con useCallback
  const calculateAirportPrice = useCallback(async () => {
    if (!transport || transport.type !== "airport") {
      return;
    }

    if (!airportServiceData.airport || !airportServiceData.destination || !airportServiceData.vehicleType) {
      setAirportCalculatedPrice(null);
      return;
    }

    setAirportCalculatingPrice(true);
    
    try {
      const selectedAirport = moroccanAirports.find(a => a.code === airportServiceData.airport);
      if (!selectedAirport) {
        setAirportCalculatedPrice(null);
        return;
      }

      // Normalizar destino/origen para comparación según dirección
      const cityInput = airportServiceData.destination.toLowerCase().trim();
      const airportCityLower = selectedAirport.city.toLowerCase();
      const cityAliases = selectedAirport.cityAliases || [airportCityLower];
      
      // Verificar si el destino/origen es la ciudad del aeropuerto
      const isSameCity = cityAliases.some(alias => 
        cityInput.includes(alias) || alias.includes(cityInput.split(' ')[0])
      );

      if (isSameCity) {
        // Precio fijo: 40€ = 435 MAD (aeropuerto a su ciudad o viceversa)
        setAirportCalculatedPrice(AIRPORT_CITY_PRICE);
      } else {
        // Calcular precio inter-ciudades + suplemento aeropuerto
        let originCity: string;
        let destinationCity: string;
        
        if (airportServiceData.direction === "from") {
          // Desde aeropuerto: origen = ciudad del aeropuerto, destino = ciudad ingresada
          originCity = selectedAirport.city;
          destinationCity = airportServiceData.destination;
        } else {
          // Hacia aeropuerto: origen = ciudad ingresada, destino = ciudad del aeropuerto
          originCity = airportServiceData.destination;
          destinationCity = selectedAirport.city;
        }
        
        // Calcular distancia y precio usando la API
        const distanceResult = await calculateDistance(
          originCity,
          destinationCity,
          airportServiceData.vehicleType,
          airportServiceData.passengers
        );

        if (distanceResult && distanceResult.price) {
          // Añadir suplemento de aeropuerto (5€ = 54 MAD)
          const finalPrice = distanceResult.price + AIRPORT_SUPPLEMENT;
          setAirportCalculatedPrice(Math.round(finalPrice * 100) / 100);
        } else {
          setAirportCalculatedPrice(null);
        }
      }
    } catch (error) {
      console.error("Error calculando precio aeropuerto:", error);
      setAirportCalculatedPrice(null);
    } finally {
      setAirportCalculatingPrice(false);
    }
  }, [airportServiceData, moroccanAirports, transport]);

  useEffect(() => {
    if (!transport || transport.type !== "airport") return;
    
    // Debounce para evitar múltiples llamadas
    const timeoutId = setTimeout(() => {
      calculateAirportPrice();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [calculateAirportPrice, transport]);

  // Cargar estado de favorito
  useEffect(() => {
    if (authUtils.isAuthenticated() && id) {
      userAPI.getFavorites().then(response => {
        if (response.success && response.data) {
          const favs = Array.isArray(response.data) ? response.data : [];
          const isFav = favs.some((f: any) => f.serviceType === 'transport' && f.serviceId === id);
          setIsFavorite(isFav);
        }
      }).catch(() => {});
    }
  }, [id]);

  const handleToggleFavorite = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!id) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Buscar el ID del favorito para eliminarlo
        const favResponse = await userAPI.getFavorites();
        if (favResponse.success && favResponse.data) {
          const favs = Array.isArray(favResponse.data) ? favResponse.data : [];
          const favToRemove = favs.find((f: any) => f.serviceType === 'transport' && f.serviceId === id);
          if (favToRemove) {
            await userAPI.removeFavorite(favToRemove._id);
            setIsFavorite(false);
          }
        }
      } else {
        await userAPI.addFavorite('transport', id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, id, router]);

  // IMPORTANTE: Todos los hooks deben ejecutarse ANTES de los returns tempranos
  // para evitar el error React #310 (número de hooks diferente entre renders)
  
  // Memoizar IconComponent y color según el tipo de transporte (siempre se ejecutan)
  const IconComponent = useMemo(() => {
    return iconMap[transport?.icon || ''] || Car;
  }, [transport?.icon]);

  const color = useMemo(() => {
    return colorMap[transport?.type || ''] || "from-gray-500 to-gray-600";
  }, [transport?.type]);
  
  // Memoizar etiqueta y valores booleanos del tipo de transporte (siempre se ejecutan)
  const typeLabel = useMemo(() => {
    if (!transport) return "";
    switch(transport.type) {
      case 'airport': return t('transport.airportTransfer');
      case 'intercity': return t('transport.interCity');
      case 'hourly': return t('transport.hourlyService');
      case 'custom': return t('transport.customService');
      default: return transport.type;
    }
  }, [transport?.type, t]);

  const isIntercity = useMemo(() => transport?.type === "intercity", [transport?.type]);
  const isHourly = useMemo(() => transport?.type === "hourly", [transport?.type]);
  const isCustom = useMemo(() => transport?.type === "custom", [transport?.type]);
  const isAirport = useMemo(() => transport?.type === "airport", [transport?.type]);

  // Traducir el nombre y descripción del servicio
  const translatedTransport = useMemo(() => {
    if (!transport) return null;
    return translateTransport(transport, language);
  }, [transport, language]);

  const translatedTransportName = useMemo(() => {
    return translatedTransport?.name || '';
  }, [translatedTransport]);

  const translatedTransportDescription = useMemo(() => {
    return translatedTransport?.description || '';
  }, [translatedTransport]);

  // Función para traducir priceLabel que contiene "Desde"
  const translatedPriceLabel = useMemo(() => {
    if (!transport?.priceLabel) return '';
    const priceLabel = transport.priceLabel;
    
    // Obtener la traducción de "Desde" de forma segura
    const fromText = t('common.from');
    const safeFromText = fromText && fromText !== 'common.from' ? fromText : 'Desde';
    
    // Reemplazar "common.from" si aparece en el priceLabel
    if (priceLabel.includes('common.from')) {
      return priceLabel.replace(/common\.from/gi, safeFromText);
    }
    
    // Detectar si contiene "Desde", "From" o "À partir de" y extraer el precio
    const desdeMatch = priceLabel.match(/(Desde|From|À partir de)\s*(\d+(?:[.,]\d+)?)\s*€/i);
    if (desdeMatch) {
      const priceInEUR = parseFloat(desdeMatch[2].replace(',', '.'));
      // Convertir EUR a MAD (aproximadamente 1 EUR = 10.87 MAD)
      const priceInMAD = priceInEUR * 10.87;
      return safeFromText + ' ' + formatPrice(priceInMAD);
    }
    
    // Si solo contiene "Desde" sin formato específico, reemplazarlo
    if (priceLabel.match(/Desde\s*/i)) {
      return priceLabel.replace(/Desde\s*/i, safeFromText + ' ');
    }
    if (priceLabel.match(/From\s*/i)) {
      return priceLabel.replace(/From\s*/i, safeFromText + ' ');
    }
    if (priceLabel.match(/À partir de\s*/i)) {
      return priceLabel.replace(/À partir de\s*/i, safeFromText + ' ');
    }
    
    return priceLabel;
  }, [transport?.priceLabel, t, formatPrice]);

  // Ahora sí, los returns tempranos DESPUÉS de todos los hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <LoadingState message={t('transport.loadingService')} fullScreen={true} />
        <Footer />
      </div>
    );
  }

  if (error || !transport) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <ErrorState
          title={t('errors.serviceNotFound')}
          message={error || t('errors.serviceNotFoundMessage')}
          showBackButton={true}
          backUrl="/transporte"
          backLabel={t('transport.backToServices')}
          fullScreen={true}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      {/* Structured Data */}
      {transport && (
        <StructuredData
          type="Service"
          data={{
            name: transport.name,
            description: transport.description,
            provider: {
              '@type': 'TravelAgency',
              name: 'Yassline Tour',
            },
          }}
        />
      )}
      
      {/* Breadcrumbs */}
      {transport && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Breadcrumbs
            items={[
              { label: t('nav.home') || 'Inicio', href: '/' },
              { label: t('transport.vipTransfers') || 'Transporte', href: '/transporte' },
              { label: transport.name, href: `/transporte/${id}` },
            ]}
          />
        </div>
      )}
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pb-24">
        <div className="relative h-[300px] md:h-[400px] w-full bg-gradient-to-br from-[var(--yass-black)] to-[var(--yass-gold)]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          {/* Back Button y Favorito */}
          <div className="absolute top-6 left-4 md:left-8 z-10 flex items-center gap-3">
            <Link
              href="/transporte"
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {(() => {
                // Siempre usar la función de traducción, que se actualiza cuando cambia el idioma
                const backText = t('common.back');
                // Si la traducción falla, usar fallback según el idioma actual
                if (backText === 'common.back' || !backText) {
                  return language === 'es' ? 'Volver' : language === 'en' ? 'Back' : 'Retour';
                }
                return backText;
              })()}
            </Link>
            {authUtils.isAuthenticated() && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 border-2 ${
                  isFavorite 
                    ? 'bg-[var(--yass-gold)] text-white border-white/20 shadow-xl' 
                    : 'bg-white/90 text-gray-700 border-white/20 hover:bg-white'
                }`}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-2xl">
                {translatedTransportName}
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-6 font-semibold drop-shadow-lg">
                {typeLabel}
              </p>
              {(transport.priceLabel || (isIntercity && calculatedPrice !== null) || (isHourly && calculatedPrice !== null) || (isAirport && airportCalculatedPrice !== null) || isCustom) && (
                <div className="flex items-center gap-4">
                  {isIntercity && calculatedPrice !== null ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl md:text-3xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        {formatPrice(calculatedPrice)}
                      </span>
                      {calculatedDistance !== null && (
                        <span className="text-sm text-white/80">
                          {calculatedDistance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  ) : isHourly && calculatedPrice !== null ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl md:text-3xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        {formatPrice(calculatedPrice)}
                      </span>
                      <span className="text-sm text-white/80">
                        {selectedHours} {selectedHours !== 1 ? t('common.hours') : t('common.hour')} × {formatPrice(hourlyRates[selectedVehicle] || 187.5)}/{t('common.hour')}
                        {selectedHours >= 1 && selectedHours <= 2 && ' (+30%)'}
                        {selectedHours >= 3 && selectedHours <= 4 && ' (+20%)'}
                      </span>
                    </div>
                  ) : isAirport && airportCalculatedPrice !== null ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl md:text-3xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        {formatPrice(airportCalculatedPrice)}
                      </span>
                      {(() => {
                        const selectedAirport = moroccanAirports.find(a => a.code === airportServiceData.airport);
                        const destinationLower = airportServiceData.destination?.toLowerCase().trim() || '';
                        const cityAliases = selectedAirport?.cityAliases || [];
                        const isSameCity = cityAliases.some(alias => 
                          destinationLower.includes(alias) || alias.includes(destinationLower.split(' ')[0])
                        );
                        return (
                          <span className="text-sm text-white/80">
                            {isSameCity ? t('transport.fixedPrice') : t('transport.intercityPlusSupplement')}
                          </span>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                      {isHourly 
                        ? t('transport.fromHour', { price: formatPrice(transport.price || 187.5).replace(/\.00/, '') }) 
                        : isCustom 
                        ? t('transport.consultPrice') 
                        : translatedPriceLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Left Column - Description */}
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              {/* Description */}
              {isAirport ? (
                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-blue-200">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plane className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('transport.aboutService')}</h2>
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">{t('transport.premiumAirportTransfer')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-100">
                      <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium mb-4">
                        {t('transport.airportServiceDescription')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.fixedPrice')}</p>
                            <p className="text-sm text-gray-600">{t('transport.fixedPriceDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.otherCities')}</p>
                            <p className="text-sm text-gray-600">{t('transport.otherCitiesDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.flightTracking')}</p>
                            <p className="text-sm text-gray-600">{t('transport.flightTrackingDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.completeAssistance')}</p>
                            <p className="text-sm text-gray-600">{t('transport.luggageHelp')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <Clock className="w-6 h-6" />
                        <h3 className="text-xl font-extrabold">{t('transport.availability247')}</h3>
                      </div>
                      <p className="text-white/90 leading-relaxed">
                        {t('transport.availability247Description')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : isIntercity ? (
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-purple-200">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Route className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('transport.aboutService')}</h2>
                      <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">{t('transport.interCity')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-100">
                      <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium mb-4">
                        {t('transport.intercityServiceDescription')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.comfortableTravel')}</p>
                            <p className="text-sm text-gray-600">{t('transport.comfortableTravelDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.professionalDrivers')}</p>
                            <p className="text-sm text-gray-600">{t('transport.professionalDriversDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.flexibleSchedule')}</p>
                            <p className="text-sm text-gray-600">{t('transport.flexibleScheduleDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{t('transport.bestPrice')}</p>
                            <p className="text-sm text-gray-600">{t('transport.bestPriceDescription')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <MapPin className="w-6 h-6" />
                        <h3 className="text-xl font-extrabold">{t('transport.mainCities')}</h3>
                      </div>
                      <p className="text-white/90 leading-relaxed">
                        {t('transport.mainCitiesDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-gray-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{t('transport.aboutService')}</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{typeLabel}</p>
                    </div>
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                    {isCustom ? t('transport.customServiceDescription') : translatedTransportDescription}
                  </p>
                </div>
              )}

              
              {/* Origen solo para servicio por horas */}
              {isHourly && (
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('transport.pickupPoint')}</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{t('transport.indicatePickup')}</p>
                      </div>
                    </div>
                    {!isEditingRoute && (
                      <button
                        onClick={() => setIsEditingRoute(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        {(() => {
                          const editText = t('common.edit');
                          if (editText === 'common.edit' || !editText) {
                            return language === 'es' ? 'Editar' : language === 'en' ? 'Edit' : 'Modifier';
                          }
                          return editText;
                        })()}
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <MapPin className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.pickupAddress')}</p>
                        {isEditingRoute ? (
                          <input
                            type="text"
                            value={route.from}
                            onChange={(e) => setRoute({ ...route, from: e.target.value })}
                            placeholder={t('transport.pickupPlaceholder')}
                            className="w-full px-5 py-4 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-lg bg-white shadow-sm transition-all duration-200"
                            autoFocus
                          />
                        ) : (
                          <p className="text-xl font-bold text-gray-900">
                            {route.from || t('transport.notSpecified')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Botones de edición para servicio por horas */}
                  {isEditingRoute && (
                    <div className="flex gap-4 pt-6 mt-6 border-t-2 border-gray-200">
                      <button
                        onClick={() => {
                          setIsEditingRoute(false);
                          // Restaurar valores originales si se cancela
                          if (transport?.route) {
                            setRoute({
                              from: transport.route.from || "",
                              to: transport.route.to || "",
                            });
                          }
                        }}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      >
                        {(() => {
                          const cancelText = t('common.cancel');
                          if (cancelText === 'common.cancel' || !cancelText) {
                            return language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler';
                          }
                          return cancelText;
                        })()}
                      </button>
                      <button
                        onClick={() => setIsEditingRoute(false)}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        {(() => {
                          const saveText = t('common.save');
                          if (saveText === 'common.save' || !saveText) {
                            return language === 'es' ? 'Guardar' : language === 'en' ? 'Save' : 'Enregistrer';
                          }
                          return saveText;
                        })()}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ruta para servicio inter-ciudades */}
              {isIntercity && (
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Route className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('transport.interCity')}</h2>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{t('transport.selectRoute')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Origen */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <MapPin className="w-7 h-7 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.origin')}</p>
                          <input
                            type="text"
                            value={route.from}
                            onChange={(e) => setRoute({ ...route, from: e.target.value })}
                            placeholder={t('transport.examplePlaceholder')}
                            className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 font-semibold text-lg bg-white shadow-sm transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Destino */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <MapPin className="w-7 h-7 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.finalDestination')}</p>
                          <input
                            type="text"
                            value={route.to}
                            onChange={(e) => setRoute({ ...route, to: e.target.value })}
                            placeholder={t('transport.examplePlaceholderDestination')}
                            className="w-full px-5 py-4 border-2 border-pink-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-900 font-semibold text-lg bg-white shadow-sm transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selector de vehículo y pasajeros integrado */}
                  {vehicles.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.vehicleType')}
                        </label>
                        <select
                          value={selectedVehicle}
                          onChange={(e) => {
                            const newVehicleType = e.target.value;
                            setSelectedVehicle(newVehicleType);
                            // Ajustar número de pasajeros al cambiar de vehículo
                            const newVehicle = vehicles.find(v => v.type === newVehicleType);
                            if (newVehicle) {
                              const maxPassengers = newVehicle.capacity?.passengers || 7;
                              if (selectedPassengers > maxPassengers) {
                                setSelectedPassengers(maxPassengers);
                                setPassengersInput(maxPassengers.toString());
                              }
                            }
                          }}
                          className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 font-semibold text-base bg-white shadow-sm transition-all duration-200 hover:border-purple-400"
                        >
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle.type}>
                              {vehicle.name} ({vehicle.capacity?.passengers} {t('vehicles.seats')})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.numberOfPassengers')}
                        </label>
                        {(() => {
                          const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle);
                          const maxPassengers = selectedVehicleData?.capacity?.passengers || 7;
                          
                          const handlePassengersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            // Permitir campo vacío mientras el usuario escribe
                            if (value === '') {
                              setPassengersInput('');
                              return;
                            }
                            // Solo permitir números
                            if (/^\d+$/.test(value)) {
                              setPassengersInput(value);
                              const numValue = parseInt(value);
                              if (numValue >= 1 && numValue <= maxPassengers) {
                                setSelectedPassengers(numValue);
                              }
                            }
                          };

                          const handlePassengersBlur = () => {
                            // Validar cuando el campo pierde el foco
                            const numValue = parseInt(passengersInput);
                            if (isNaN(numValue) || numValue < 1) {
                              setPassengersInput('1');
                              setSelectedPassengers(1);
                            } else if (numValue > maxPassengers) {
                              setPassengersInput(maxPassengers.toString());
                              setSelectedPassengers(maxPassengers);
                            } else {
                              setPassengersInput(numValue.toString());
                              setSelectedPassengers(numValue);
                            }
                          };

                          const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Usar el valor actual del input si está disponible, sino usar selectedPassengers
                            const currentInputValue = parseInt(passengersInput);
                            const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                              ? currentInputValue 
                              : selectedPassengers;
                            
                            if (current < maxPassengers) {
                              const newValue = current + 1;
                              setSelectedPassengers(newValue);
                              setPassengersInput(newValue.toString());
                            }
                          };

                          const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Usar el valor actual del input si está disponible, sino usar selectedPassengers
                            const currentInputValue = parseInt(passengersInput);
                            const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                              ? currentInputValue 
                              : selectedPassengers;
                            
                            if (current > 1) {
                              const newValue = current - 1;
                              setSelectedPassengers(newValue);
                              setPassengersInput(newValue.toString());
                            }
                          };

                          return (
                            <>
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={passengersInput}
                                  onChange={handlePassengersChange}
                                  onBlur={handlePassengersBlur}
                                  onKeyDown={(e) => {
                                    // Permitir Enter para validar
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                      return;
                                    }
                                    // Permitir borrar, tab, escape, flechas, etc.
                                    if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                                      return;
                                    }
                                    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                                      return;
                                    }
                                    // Solo permitir números
                                    if (!/^\d$/.test(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
                                    const numValue = parseInt(paste);
                                    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxPassengers) {
                                      setPassengersInput(numValue.toString());
                                      setSelectedPassengers(numValue);
                                    }
                                  }}
                                  className="w-full px-5 py-4 pr-20 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 bg-white font-semibold text-base shadow-sm transition-all duration-200 hover:border-purple-400"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={handleIncrement}
                                    disabled={(() => {
                                      const currentInputValue = parseInt(passengersInput);
                                      const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                                        ? currentInputValue 
                                        : selectedPassengers;
                                      return current >= maxPassengers;
                                    })()}
                                    className="p-1 rounded-md bg-gray-100 hover:bg-purple-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-900 transition-all duration-200 flex items-center justify-center min-w-[28px] min-h-[28px]"
                                    aria-label="Incrementar"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleDecrement}
                                    disabled={(() => {
                                      const currentInputValue = parseInt(passengersInput);
                                      const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                                        ? currentInputValue 
                                        : selectedPassengers;
                                      return current <= 1;
                                    })()}
                                    className="p-1 rounded-md bg-gray-100 hover:bg-purple-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-900 transition-all duration-200 flex items-center justify-center min-w-[28px] min-h-[28px]"
                                    aria-label="Decrementar"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 font-medium">
                                {t('common.maximum')}: {maxPassengers} {t('common.passengers')}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {t('vehicles.noVehiclesAvailable') || 'No hay vehículos disponibles en este momento. Por favor, contacta con nosotros para más información.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
                  
              {/* Mostrar distancia y precio calculado para inter-ciudades */}
              {isIntercity && calculatedDistance !== null && calculatedPrice !== null && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('transport.calculatedDistance')}</p>
                      <p className="text-lg font-semibold text-gray-900">{calculatedDistance} km</p>
                      {selectedVehicle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {vehicles.find(v => v.type === selectedVehicle)?.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{t('transport.estimatedPrice')}</p>
                      <p className="text-xl font-bold text-[var(--yass-gold)]">{formatPrice(calculatedPrice)}</p>
                    </div>
                  </div>
                  {/* Mensaje informativo sobre suplemento de aeropuerto si aplica */}
                  {(() => {
                    const fromLower = route.from.toLowerCase();
                    const toLower = route.to.toLowerCase();
                    const fromHasAirport = fromLower.includes('aeropuerto') || 
                      moroccanAirports.some(airport => {
                        return (airport.cityAliases.some(alias => fromLower.includes(alias)) ||
                               fromLower.includes(airport.city.toLowerCase())) &&
                               (fromLower.includes('aeropuerto') || fromLower.includes(airport.code.toLowerCase()));
                      });
                    const toHasAirport = toLower.includes('aeropuerto') ||
                      moroccanAirports.some(airport => {
                        return (airport.cityAliases.some(alias => toLower.includes(alias)) ||
                               toLower.includes(airport.city.toLowerCase())) &&
                               (toLower.includes('aeropuerto') || toLower.includes(airport.code.toLowerCase()));
                      });
                    const hasAirportInRoute = fromHasAirport || toHasAirport;
                    
                    if (hasAirportInRoute) {
                      return (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <Plane className="w-3 h-3" />
                            {t('transport.intercityPlusSupplement') || 'Incluye suplemento de aeropuerto (5€)'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              
              {isIntercity && calculatingDistance && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--yass-gold)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">{t('common.calculating')}</p>
                  </div>
                </div>
              )}

              {/* Formulario para Servicio de Aeropuerto */}
              {isAirport && vehicles.length > 0 && (
                <div className="mt-8 p-8 bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900">{t('transport.configureTransfer')}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{t('transport.completeFlightData')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dirección del Traslado */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.transferType')}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAirportServiceData({ ...airportServiceData, direction: "from" })}
                          className={`px-6 py-4 rounded-xl border-2 font-bold transition-all duration-200 ${
                            airportServiceData.direction === "from"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <Plane className="w-6 h-6 mx-auto mb-2" />
                          {t('transport.fromAirport')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAirportServiceData({ ...airportServiceData, direction: "to" })}
                          className={`px-6 py-4 rounded-xl border-2 font-bold transition-all duration-200 ${
                            airportServiceData.direction === "to"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <MapPin className="w-6 h-6 mx-auto mb-2" />
                          {t('transport.toAirport')}
                        </button>
                      </div>
                    </div>

                    {/* Tipo de Vehículo */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.vehicleType')}
                      </label>
                      {vehicles.length === 0 ? (
                        <div className="w-full px-5 py-4 border-2 border-yellow-300 rounded-xl bg-yellow-50">
                          <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {t('vehicles.noVehiclesAvailable') || 'No hay vehículos disponibles en este momento. Por favor, contacta con nosotros para más información.'}
                          </p>
                        </div>
                      ) : (
                        <select
                          value={airportServiceData.vehicleType}
                          onChange={(e) => {
                            const newVehicleType = e.target.value;
                            setAirportServiceData({ ...airportServiceData, vehicleType: newVehicleType });
                            setSelectedVehicle(newVehicleType);
                            const newVehicle = vehicles.find(v => v.type === newVehicleType);
                            if (newVehicle) {
                              const maxPassengers = newVehicle.capacity?.passengers || 7;
                              if (airportServiceData.passengers > maxPassengers) {
                                setAirportServiceData({ ...airportServiceData, vehicleType: newVehicleType, passengers: maxPassengers });
                                setSelectedPassengers(maxPassengers);
                                setPassengersInput(maxPassengers.toString());
                              }
                            }
                          }}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                        >
                          <option value="">{t('transport.selectVehicle')}</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle.type}>
                              {vehicle.name} ({vehicle.capacity?.passengers} {t('transport.seats')})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Número de Pasajeros */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.numberOfPassengers')}
                      </label>
                      {(() => {
                        const selectedVehicleData = vehicles.find(v => v.type === airportServiceData.vehicleType);
                        const maxPassengers = selectedVehicleData?.capacity?.passengers || 7;
                        return (
                          <>
                            <input
                              type="number"
                              min="1"
                              max={maxPassengers}
                              value={airportServiceData.passengers}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                const finalValue = value > maxPassengers ? maxPassengers : (value < 1 ? 1 : value);
                                setAirportServiceData({ ...airportServiceData, passengers: finalValue });
                                setSelectedPassengers(finalValue);
                              }}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              {airportServiceData.vehicleType ? `${t('common.maximum')}: ${maxPassengers} ${t('common.passengers')}` : t('transport.selectVehicleFirst')}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Fecha del Vuelo */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.flightDate')}
                      </label>
                      <input
                        type="date"
                        value={airportServiceData.flightDate}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, flightDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      />
                    </div>

                    {/* Hora del Vuelo */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.flightTime')}
                      </label>
                      <input
                        type="time"
                        value={airportServiceData.flightTime}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, flightTime: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      />
                    </div>

                    {/* Número de Vuelo */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.flightNumber')}
                      </label>
                      <input
                        type="text"
                        value={airportServiceData.flightNumber}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, flightNumber: e.target.value })}
                        placeholder={t('transport.flightNumberPlaceholder')}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      />
                    </div>

                    {/* Equipaje */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.luggageOptional')}
                      </label>
                      <select
                        value={airportServiceData.luggage}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, luggage: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      >
                        <option value="">{t('transport.selectLuggage')}</option>
                        <option value="1-2 maletas">{t('transport.luggage12')}</option>
                        <option value="3-4 maletas">{t('transport.luggage34')}</option>
                        <option value="5+ maletas">{t('transport.luggage5plus')}</option>
                        <option value="Equipaje especial">{t('transport.specialLuggage')}</option>
                      </select>
                    </div>

                    {/* Selección de Aeropuerto */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.airport')}
                      </label>
                      <select
                        value={airportServiceData.airport}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, airport: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      >
                        <option value="">{t('transport.selectAirport')}</option>
                        {moroccanAirports.map((airport) => (
                          <option key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dirección de Destino/Origen */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {airportServiceData.direction === "from" ? t('transport.destinationAddress') : t('transport.originAddress')}
                      </label>
                      <input
                        type="text"
                        value={airportServiceData.destination}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, destination: e.target.value })}
                        placeholder={t('transport.destinationPlaceholder')}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-blue-300 shadow-sm bg-white"
                      />
                    </div>

                    {/* Requisitos Especiales */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.specialRequirements')}
                      </label>
                      <textarea
                        value={airportServiceData.specialRequirements}
                        onChange={(e) => setAirportServiceData({ ...airportServiceData, specialRequirements: e.target.value })}
                        placeholder={t('transport.specialRequirementsPlaceholder')}
                        rows={3}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium text-base bg-white shadow-sm transition-all duration-200 hover:border-blue-300"
                      />
                    </div>
                  </div>

                  {/* Mostrar precio calculado */}
                  {airportCalculatingPrice && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">{t('transport.calculatingPrice')}</p>
                      </div>
                    </div>
                  )}

                  {!airportCalculatingPrice && airportCalculatedPrice !== null && airportServiceData.airport && airportServiceData.destination && airportServiceData.vehicleType && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl shadow-xl border-2 border-blue-400">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white/90 uppercase tracking-wider mb-2">{t('transport.totalPrice')}</p>
                            <p className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg">{formatPrice(airportCalculatedPrice)}</p>
                            {(() => {
                              const selectedAirport = moroccanAirports.find(a => a.code === airportServiceData.airport);
                              const destinationLower = airportServiceData.destination.toLowerCase().trim();
                              const cityAliases = selectedAirport?.cityAliases || [];
                              const isSameCity = cityAliases.some(alias => 
                                destinationLower.includes(alias) || alias.includes(destinationLower.split(' ')[0])
                              );
                              
                              if (isSameCity) {
                                return (
                                  <p className="text-sm text-white/80">
                                    {t('transport.fixedPriceAirport', { city: selectedAirport?.city ?? 'la ciudad' })}
                                  </p>
                                );
                              } else {
                                return (
                                  <p className="text-sm text-white/80">
                                    {t('transport.intercityPlusSupplement')}
                                  </p>
                                );
                              }
                            })()}
                          </div>
                          <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">{t('common.vehicle')}</p>
                            <p className="text-lg font-extrabold text-white">
                              {vehicles.find(v => v.type === airportServiceData.vehicleType)?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información Adicional */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-2">{t('transport.whatIncludes')}</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• {t('transport.includesFlightTracking')}</li>
                          <li>• {t('transport.includesDriverSign')}</li>
                          <li>• {t('transport.includes60minWait')}</li>
                          <li>• {t('transport.includesLuggageHelp')}</li>
                          <li>• {t('transport.includesLuxuryVehicles')}</li>
                          <li>• {t('transport.includes247')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Selector de vehículo y horas para servicio por horas */}
              {isHourly && !isEditingRoute && vehicles.length > 0 && (
                <div className="mt-8 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900">{t('transport.configureService')}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t('transport.customizeExperience')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Selector de Vehículo */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.vehicleType')}
                      </label>
                      <select
                        value={selectedVehicle}
                        onChange={(e) => {
                          const newVehicleType = e.target.value;
                          setSelectedVehicle(newVehicleType);
                          const newVehicle = vehicles.find(v => v.type === newVehicleType);
                          if (newVehicle) {
                            const maxPassengers = newVehicle.capacity?.passengers || 7;
                            if (selectedPassengers > maxPassengers) {
                              setSelectedPassengers(maxPassengers);
                              setPassengersInput(maxPassengers.toString());
                            }
                          }
                        }}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 bg-white font-semibold text-base transition-all duration-200 hover:border-green-300 shadow-sm"
                      >
                        {vehicles.map((vehicle) => (
                          <option key={vehicle._id} value={vehicle.type}>
                            {vehicle.name} ({vehicle.capacity?.passengers} plazas) - {formatPrice(hourlyRates[vehicle.type] || 187.5)}/h
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selector de Horas */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.numberOfHours')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={selectedHours}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            const finalValue = value > 24 ? 24 : (value < 1 ? 1 : value);
                            setSelectedHours(finalValue);
                          }}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 bg-white font-semibold text-base transition-all duration-200 hover:border-green-300 shadow-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          {selectedHours} {selectedHours === 1 ? t('common.hour') : t('common.hours')}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        {t('transport.minimum1hour')}
                      </p>
                    </div>

                    {/* Selector de Pasajeros */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {t('transport.numberOfPassengers')}
                      </label>
                      {(() => {
                        const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle);
                        const maxPassengers = selectedVehicleData?.capacity?.passengers || 7;
                        
                        const handlePassengersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          // Permitir campo vacío mientras el usuario escribe
                          if (value === '') {
                            setPassengersInput('');
                            return;
                          }
                          // Solo permitir números
                          if (/^\d+$/.test(value)) {
                            setPassengersInput(value);
                            const numValue = parseInt(value);
                            if (numValue >= 1 && numValue <= maxPassengers) {
                              setSelectedPassengers(numValue);
                            }
                          }
                        };

                        const handlePassengersBlur = () => {
                          // Validar cuando el campo pierde el foco
                          const numValue = parseInt(passengersInput);
                          if (isNaN(numValue) || numValue < 1) {
                            setPassengersInput('1');
                            setSelectedPassengers(1);
                          } else if (numValue > maxPassengers) {
                            setPassengersInput(maxPassengers.toString());
                            setSelectedPassengers(maxPassengers);
                          } else {
                            setPassengersInput(numValue.toString());
                            setSelectedPassengers(numValue);
                          }
                        };

                        const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Usar el valor actual del input si está disponible, sino usar selectedPassengers
                          const currentInputValue = parseInt(passengersInput);
                          const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                            ? currentInputValue 
                            : selectedPassengers;
                          
                          if (current < maxPassengers) {
                            const newValue = current + 1;
                            setSelectedPassengers(newValue);
                            setPassengersInput(newValue.toString());
                          }
                        };

                        const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Usar el valor actual del input si está disponible, sino usar selectedPassengers
                          const currentInputValue = parseInt(passengersInput);
                          const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                            ? currentInputValue 
                            : selectedPassengers;
                          
                          if (current > 1) {
                            const newValue = current - 1;
                            setSelectedPassengers(newValue);
                            setPassengersInput(newValue.toString());
                          }
                        };

                        return (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={passengersInput}
                                onChange={handlePassengersChange}
                                onBlur={handlePassengersBlur}
                                onKeyDown={(e) => {
                                  // Permitir Enter para validar
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                    return;
                                  }
                                  // Permitir borrar, tab, escape, flechas, etc.
                                  if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                                    return;
                                  }
                                  // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                                    return;
                                  }
                                  // Solo permitir números
                                  if (!/^\d$/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
                                  const numValue = parseInt(paste);
                                  if (!isNaN(numValue) && numValue >= 1 && numValue <= maxPassengers) {
                                    setPassengersInput(numValue.toString());
                                    setSelectedPassengers(numValue);
                                  }
                                }}
                                className="w-full px-5 py-4 pr-20 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 bg-white font-semibold text-base transition-all duration-200 hover:border-green-300 shadow-sm"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={handleIncrement}
                                  disabled={(() => {
                                    const currentInputValue = parseInt(passengersInput);
                                    const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                                      ? currentInputValue 
                                      : selectedPassengers;
                                    return current >= maxPassengers;
                                  })()}
                                  className="p-1 rounded-md bg-gray-100 hover:bg-green-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-900 transition-all duration-200 flex items-center justify-center min-w-[28px] min-h-[28px]"
                                  aria-label="Incrementar"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDecrement}
                                  disabled={(() => {
                                    const currentInputValue = parseInt(passengersInput);
                                    const current = (!isNaN(currentInputValue) && currentInputValue >= 1 && currentInputValue <= maxPassengers) 
                                      ? currentInputValue 
                                      : selectedPassengers;
                                    return current <= 1;
                                  })()}
                                  className="p-1 rounded-md bg-gray-100 hover:bg-green-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-900 transition-all duration-200 flex items-center justify-center min-w-[28px] min-h-[28px]"
                                  aria-label="Decrementar"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              {t('common.maximum')}: {maxPassengers} {maxPassengers === 1 ? t('common.passenger') : t('common.passengers')}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mostrar precio calculado para servicio por horas */}
              {isHourly && !isEditingRoute && calculatedPrice !== null && selectedVehicle && (
                <div className="mt-8 p-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl border-2 border-green-400 transform hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white/90 uppercase tracking-wider mb-2">{t('transport.totalPrice')}</p>
                        <p className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">{formatPrice(calculatedPrice)}</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white/90">
                              {selectedHours} {selectedHours !== 1 ? t('common.hours') : t('common.hour')} × {formatPrice(hourlyRates[selectedVehicle])}/{t('common.hour')}
                            </span>
                            {selectedHours >= 1 && selectedHours <= 2 && (
                              <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">+30%</span>
                            )}
                            {selectedHours >= 3 && selectedHours <= 4 && (
                              <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">+20%</span>
                            )}
                          </div>
                          {(selectedHours >= 1 && selectedHours <= 2) && (
                            <div className="pt-2 border-t border-white/20 text-xs text-white/80">
                              <span className="font-medium">{t('common.base') || 'Base'}: {formatPrice(hourlyRates[selectedVehicle] * selectedHours)}</span>
                              <span className="mx-2">+</span>
                              <span className="font-medium">{t('common.supplement') || 'Suplemento'}: {formatPrice((hourlyRates[selectedVehicle] * selectedHours) * 0.30)}</span>
                            </div>
                          )}
                          {(selectedHours >= 3 && selectedHours <= 4) && (
                            <div className="pt-2 border-t border-white/20 text-xs text-white/80">
                              <span className="font-medium">{t('common.base') || 'Base'}: {formatPrice(hourlyRates[selectedVehicle] * selectedHours)}</span>
                              <span className="mx-2">+</span>
                              <span className="font-medium">{t('common.supplement') || 'Suplemento'}: {formatPrice((hourlyRates[selectedVehicle] * selectedHours) * 0.20)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center md:text-right bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">{t('transport.selectedVehicle')}</p>
                        <p className="text-lg font-extrabold text-white">
                          {vehicles.find(v => v.type === selectedVehicle)?.name}
                        </p>
                        <p className="text-xs text-white/70 mt-2">
                          {vehicles.find(v => v.type === selectedVehicle)?.capacity?.passengers} {vehicles.find(v => v.type === selectedVehicle)?.capacity?.passengers === 1 ? t('common.passenger') : t('common.passengers')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Servicio y Suplementos - Solo para servicio por horas */}
              {isHourly && (
                <div className="mt-12 space-y-8">
                  {/* Información del Servicio */}
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-blue-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{t('transport.serviceInfo')}</h2>
                        <p className="text-gray-600 text-sm font-medium">{t('transport.serviceInfoDescription')}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                      {t('transport.hourlyServiceDescription')}
                    </p>
                    
                    {/* Precios por Hora */}
                    <div className="bg-white rounded-2xl p-8 mb-8 border-2 border-blue-100 shadow-lg">
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                        <Clock className="w-7 h-7 text-blue-600" />
                        {t('transport.hourlyRates')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.mercedesVito')}</p>
                          <p className="text-3xl font-extrabold text-gray-900 mb-2">{formatPrice(187.5)}/h</p>
                          <p className="text-xs text-gray-500 font-medium">{t('transport.upTo7Passengers')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.mercedesVClass')}</p>
                          <p className="text-3xl font-extrabold text-gray-900 mb-2">{formatPrice(250)}/h</p>
                          <p className="text-xs text-gray-500 font-medium">{t('transport.upTo6Passengers')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t('transport.mercedesSprinter')}</p>
                          <p className="text-3xl font-extrabold text-gray-900 mb-2">{formatPrice(275)}/h</p>
                          <p className="text-xs text-gray-500 font-medium">{t('transport.upTo18Passengers')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sistema de Suplementos */}
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300 shadow-lg">
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                        <span className="text-3xl">💰</span>
                        {t('transport.supplementsSystem')}
                      </h3>
                      <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                        {t('transport.supplementsDescription')}
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 bg-white rounded-xl p-6 border-2 border-amber-200 hover:shadow-lg transition-all duration-200">
                          <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-lg">
                            1-2
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-gray-900 text-lg mb-1">{t('transport.supplement12hours')}</p>
                            <p className="text-sm text-gray-600 mb-2">{t('transport.supplement12hoursDescription')}</p>
                            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-mono">{t('transport.exampleVClass', { price1: formatPrice(500), price2: formatPrice(650) })}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
                          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-lg">
                            3-4
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-gray-900 text-lg mb-1">{t('transport.supplement34hours')}</p>
                            <p className="text-sm text-gray-600 mb-2">{t('transport.supplement34hoursDescription')}</p>
                            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-mono">{t('transport.exampleVito', { price1: formatPrice(750), price2: formatPrice(900) })}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 hover:shadow-lg transition-all duration-200">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-lg">
                            5+
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-gray-900 text-lg mb-1">{t('transport.supplement5plus')}</p>
                            <p className="text-sm text-gray-600 mb-2">{t('transport.supplement5plusDescription')}</p>
                            <p className="text-xs text-gray-500 bg-white rounded-lg px-3 py-2 font-mono">{t('transport.exampleSprinter', { price: formatPrice(1650) })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario para Servicio Personalizado */}
              {isCustom && (
                <div className="mt-8 space-y-8">
                  {/* Información del Servicio Personalizado */}
                  <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-orange-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Route className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{t('transport.customServiceTitle')}</h2>
                        <p className="text-gray-600 text-sm font-medium">{t('transport.customServiceDescription')}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                      {t('transport.customServiceDescription')}
                    </p>
                  </div>

                  {/* Formulario de Configuración */}
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                        <Route className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900">{t('transport.customServiceTitle')}</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{t('transport.completeFormCustom')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Descripción del Servicio */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.describeServiceItinerary')}
                        </label>
                        <textarea
                          value={customServiceData.description}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, description: e.target.value })}
                          placeholder={t('transport.serviceDescriptionPlaceholder')}
                          rows={4}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium text-base bg-white shadow-sm transition-all duration-200 hover:border-orange-300"
                        />
                      </div>

                      {/* Tipo de Vehículo */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.preferredVehicle')}
                        </label>
                        <select
                          value={customServiceData.vehicleType}
                          onChange={(e) => {
                            setCustomServiceData({ ...customServiceData, vehicleType: e.target.value });
                            setSelectedVehicle(e.target.value);
                          }}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        >
                          <option value="">{t('transport.selectVehicle')}</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle.type}>
                              {vehicle.name} ({vehicle.capacity?.passengers} {t('vehicles.seats')})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Número de Pasajeros */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.numberOfPassengers')}
                        </label>
                        {(() => {
                          const selectedVehicleData = vehicles.find(v => v.type === customServiceData.vehicleType);
                          const maxPassengers = selectedVehicleData?.capacity?.passengers || 18;
                          return (
                            <>
                              <input
                                type="number"
                                min="1"
                                max={maxPassengers}
                                value={customServiceData.passengers}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  const finalValue = value > maxPassengers ? maxPassengers : (value < 1 ? 1 : value);
                                  setCustomServiceData({ ...customServiceData, passengers: finalValue });
                                  setSelectedPassengers(finalValue);
                                }}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                              />
                              <p className="text-xs text-gray-500 mt-2 font-medium">
                                {customServiceData.vehicleType ? `${t('common.maximum')}: ${maxPassengers} ${t('common.passengers')}` : t('transport.selectVehicleFirst')}
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {/* Origen */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.origin')}
                        </label>
                        <input
                          type="text"
                          value={customServiceData.origin}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, origin: e.target.value })}
                          placeholder={t('transport.originPlaceholder')}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Destino */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.finalDestination')}
                        </label>
                        <input
                          type="text"
                          value={customServiceData.destination}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, destination: e.target.value })}
                          placeholder={t('transport.destinationPlaceholder2')}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Fecha de Inicio */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.startDate')}
                        </label>
                        <input
                          type="date"
                          value={customServiceData.startDate}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            setCustomServiceData({ 
                              ...customServiceData, 
                              startDate: newStartDate,
                              // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizarla
                              endDate: customServiceData.endDate && customServiceData.endDate < newStartDate ? newStartDate : customServiceData.endDate
                            });
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Fecha de Fin */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.endDate')}
                        </label>
                        <input
                          type="date"
                          value={customServiceData.endDate}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, endDate: e.target.value })}
                          min={customServiceData.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Hora de Inicio */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.startTime')}
                        </label>
                        <input
                          type="time"
                          value={customServiceData.startTime}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, startTime: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Hora de Fin */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.endTime')}
                        </label>
                        <input
                          type="time"
                          value={customServiceData.endTime}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, endTime: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-semibold text-base transition-all duration-200 hover:border-orange-300 shadow-sm bg-white"
                        />
                      </div>

                      {/* Requisitos Especiales */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                          {t('transport.specialRequirements')}
                        </label>
                        <textarea
                          value={customServiceData.specialRequirements}
                          onChange={(e) => setCustomServiceData({ ...customServiceData, specialRequirements: e.target.value })}
                          placeholder={t('transport.specialRequirementsPlaceholder2')}
                          rows={3}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium text-base bg-white shadow-sm transition-all duration-200 hover:border-orange-300"
                        />
                      </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-2">{t('transport.customServiceIncludes')}</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• {t('transport.includesCustomQuote')}</li>
                            <li>• {t('transport.includesProfessionalAdvice')}</li>
                            <li>• {t('transport.includesFlexibility')}</li>
                            <li>• {t('transport.includesLuxuryVehicles2')}</li>
                            <li>• {t('transport.includesQuickResponse')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('transport.includesTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesProfessionalDriver')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesLuxuryVehicles')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesPunctuality')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesTravelInsurance')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesAirConditioning')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{t('transport.includesFreeWifi')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm
                  key={`${route.from}-${route.to}-${selectedVehicle}-${selectedPassengers}-${selectedHours}-${isCustom ? JSON.stringify(customServiceData) : ''}-${isAirport ? JSON.stringify(airportServiceData) : ''}`}
                  serviceName={translatedTransportName}
                  serviceType={transport.type}
                  serviceId={transport._id}
                  calculatedPrice={calculatedPrice || airportCalculatedPrice || undefined}
                  defaultRoute={
                    isCustom 
                      ? { from: customServiceData.origin, to: customServiceData.destination }
                      : isAirport
                      ? { 
                          from: airportServiceData.direction === "from" 
                            ? (airportServiceData.airport ? moroccanAirports.find(a => a.code === airportServiceData.airport)?.name || t('transport.airport') : t('transport.airport'))
                            : airportServiceData.destination,
                          to: airportServiceData.direction === "from" 
                            ? airportServiceData.destination
                            : (airportServiceData.airport ? moroccanAirports.find(a => a.code === airportServiceData.airport)?.name || t('transport.airport') : t('transport.airport'))
                        }
                      : route
                  }
                  priceLabel={
                    (isIntercity && calculatedPrice !== null)
                      ? formatPrice(calculatedPrice)
                      : (isHourly && calculatedPrice !== null)
                      ? `${formatPrice(calculatedPrice)} (${selectedHours}${t('common.hour') || 'h'} × ${formatPrice(hourlyRates[selectedVehicle] || 187.5)}/${t('common.hour') || 'h'}${selectedHours >= 1 && selectedHours <= 2 ? ' +30%' : selectedHours >= 3 && selectedHours <= 4 ? ' +20%' : ''})`
                      : (isAirport && airportCalculatedPrice !== null)
                      ? formatPrice(airportCalculatedPrice)
                      : (isHourly ? t('transport.fromHour', { price: formatPrice(transport.price || 187.5).replace(/\.00/, '') }) : (isCustom ? t('transport.consultPrice') : translatedPriceLabel))
                  }
                  vehicleType={isCustom ? customServiceData.vehicleType : (isAirport ? airportServiceData.vehicleType : selectedVehicle)}
                  passengers={isCustom ? customServiceData.passengers : (isAirport ? airportServiceData.passengers : selectedPassengers)}
                  hours={isHourly ? selectedHours : undefined}
                  customData={isCustom ? customServiceData : undefined}
                  airportData={isAirport ? airportServiceData : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[var(--yass-black)] to-[var(--yass-gold)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('transport.questionsAboutService')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('transport.teamAvailable')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="bg-white text-[var(--yass-gold)] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {t('transport.contactButton')}
            </Link>
            <Link
              href="/transporte"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              {t('transport.viewMoreServices')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
