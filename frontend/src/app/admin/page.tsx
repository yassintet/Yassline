"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Home,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  XCircle,
  Eye,
  Clock,
  Mail,
  Phone,
  Users,
  BarChart3,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  Star,
  FileText
} from "lucide-react";
import { getVehicleIcon } from "@/lib/vehicleIcons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { authUtils } from "@/lib/auth";
import { circuitsAPI, transportsAPI, vehiclesAPI, bookingsAPI, analyticsAPI, authAPI } from "@/lib/api";

interface Circuit {
  _id: string;
  name: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  featured: boolean;
  active: boolean;
}

interface Transport {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  active: boolean;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  description: string;
  active: boolean;
}

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'circuits' | 'transports' | 'vehicles' | 'bookings' | 'analytics'>('analytics');
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Debounce de la búsqueda para evitar filtros excesivos
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Verificar autenticación
    const token = authUtils.getToken();
    const user = authUtils.getUser();
    
    console.log('🔐 Verificando autenticación:', {
      hasToken: !!token,
      tokenLength: token?.length,
      user: user,
      isAdmin: authUtils.isAdmin()
    });
    
    if (!token) {
      console.warn('⚠️ No hay token, redirigiendo a login');
      router.push('/login');
      return;
    }
    
    if (!authUtils.isAdmin()) {
      console.warn('⚠️ Usuario no es admin, redirigiendo a login');
      router.push('/login');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Recargar datos cuando cambien los filtros o paginación
  useEffect(() => {
    if (authUtils.isAuthenticated() && authUtils.isAdmin()) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, statusFilter, serviceTypeFilter, debouncedSearchQuery, dateFrom, dateTo, minPrice, maxPrice]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const bookingsParams: any = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      };
      
      if (statusFilter !== 'all') bookingsParams.status = statusFilter;
      if (serviceTypeFilter !== 'all') bookingsParams.serviceType = serviceTypeFilter;
      if (debouncedSearchQuery) bookingsParams.search = debouncedSearchQuery;
      if (dateFrom) bookingsParams.dateFrom = dateFrom;
      if (dateTo) bookingsParams.dateTo = dateTo;
      if (minPrice) bookingsParams.minPrice = parseFloat(minPrice);
      if (maxPrice) bookingsParams.maxPrice = parseFloat(maxPrice);

      const promises: any[] = [
        circuitsAPI.getAll(),
        transportsAPI.getAll(),
        vehiclesAPI.getAll(),
        bookingsAPI.getAll(bookingsParams),
      ];
      
      if (activeTab === 'analytics') {
        promises.push(analyticsAPI.getDashboardStats());
      }
      
      const results = await Promise.all(promises);
      const [circuitsRes, transportsRes, vehiclesRes, bookingsRes, analyticsRes] = results;

      if (circuitsRes.success && circuitsRes.data) {
        setCircuits(Array.isArray(circuitsRes.data) ? circuitsRes.data : []);
      }
      if (transportsRes.success && transportsRes.data) {
        setTransports(Array.isArray(transportsRes.data) ? transportsRes.data : []);
      }
      if (vehiclesRes.success && vehiclesRes.data) {
        setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      }
      if (bookingsRes.success) {
        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
        setBookings(bookingsData);
        
        // La respuesta puede tener total y totalPages en el nivel superior
        const total = bookingsRes.total !== undefined ? bookingsRes.total : bookingsData.length;
        const totalPagesValue = bookingsRes.totalPages !== undefined ? bookingsRes.totalPages : Math.ceil(total / 20);
        
        setTotalBookings(total);
        setTotalPages(totalPagesValue);
        
        if (analyticsRes && analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
        
        // Debug: mostrar en consola para verificar
        console.log('📊 Reservas cargadas:', {
          count: bookingsData.length,
          total,
          totalPages: totalPagesValue,
          page: currentPage,
          hasData: !!bookingsRes.data,
          responseKeys: Object.keys(bookingsRes)
        });
      } else {
        console.error('❌ Error cargando reservas:', bookingsRes);
        
        // Si es un error 403, redirigir a login
        if (bookingsRes.error?.includes('403') || bookingsRes.error?.includes('Forbidden') || bookingsRes.error?.includes('Token') || bookingsRes.error?.includes('acceso denegado')) {
          console.warn('⚠️ Token inválido o expirado, redirigiendo a login');
          authUtils.logout();
          router.push('/login');
          return;
        }
        
        setBookings([]);
        setTotalBookings(0);
        setTotalPages(1);
        if (bookingsRes.error) {
          setError("Error al cargar reservas: " + bookingsRes.error);
        }
      }
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError("Error al cargar los datos: " + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, statusFilter, serviceTypeFilter, debouncedSearchQuery, dateFrom, dateTo, minPrice, maxPrice]);

  const handleDelete = useCallback(async (type: 'circuits' | 'transports' | 'vehicles', id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    try {
      let response;
      if (type === 'circuits') {
        response = await circuitsAPI.delete(id);
      } else if (type === 'transports') {
        response = await transportsAPI.delete(id);
      } else {
        response = await vehiclesAPI.delete(id);
      }

      if (response.success) {
        loadData();
      } else {
        alert(response.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error al eliminar');
    }
  }, [loadData]);

  const handleLogout = useCallback(() => {
    authAPI.logout();
    router.push('/login');
  }, [router]);

  // Memoización de estadísticas para evitar recálculos innecesarios
  const stats = useMemo(() => {
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const activeCircuits = circuits.filter(c => c.active).length;
    const activeTransports = transports.filter(t => t.active).length;
    const activeVehicles = vehicles.filter(v => v.active).length;

    return {
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      activeCircuits,
      activeTransports,
      activeVehicles,
    };
  }, [bookings, circuits, transports, vehicles]);

  // Analytics avanzados - memoizados (calculados localmente)
  const computedAnalytics = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' && (b.calculatedPrice || b.total))
      .reduce((sum, b) => sum + (b.calculatedPrice || b.total || 0), 0);
    
    // Reservas por tipo de servicio
    const bookingsByServiceType = bookings.reduce((acc, booking) => {
      const type = booking.serviceType || 'custom';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Reservas por mes (últimos 6 meses)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        count: 0,
        revenue: 0,
      };
    }).reverse();

    bookings.forEach(booking => {
      if (booking.createdAt) {
        const bookingDate = new Date(booking.createdAt);
        const monthKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
        const monthData = last6Months.find(m => m.monthKey === monthKey);
        if (monthData) {
          monthData.count++;
          if (booking.status === 'confirmed' && (booking.calculatedPrice || booking.total)) {
            monthData.revenue += (booking.calculatedPrice || booking.total || 0);
          }
        }
      }
    });

    // Servicios más solicitados
    const popularServices = Object.entries(
      bookings.reduce((acc, booking) => {
        const name = booking.serviceName || 'Sin nombre';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tasa de conversión (confirmadas / total)
    const conversionRate = totalBookings > 0 
      ? ((confirmedBookings / totalBookings) * 100).toFixed(1)
      : '0';

    // Ingresos promedio por reserva confirmada
    const avgRevenuePerBooking = confirmedBookings > 0
      ? (totalRevenue / confirmedBookings).toFixed(2)
      : '0';

    // Reservas de esta semana vs semana pasada
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekBookings = bookings.filter(b => {
      if (!b.createdAt) return false;
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= thisWeekStart;
    }).length;

    const lastWeekBookings = bookings.filter(b => {
      if (!b.createdAt) return false;
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= lastWeekStart && bookingDate < thisWeekStart;
    }).length;

    const weekGrowth = lastWeekBookings > 0
      ? (((thisWeekBookings - lastWeekBookings) / lastWeekBookings) * 100).toFixed(1)
      : thisWeekBookings > 0 ? '100' : '0';

    return {
      totalBookings,
      totalRevenue,
      bookingsByServiceType,
      monthlyData: last6Months,
      popularServices,
      conversionRate,
      avgRevenuePerBooking,
      thisWeekBookings,
      lastWeekBookings,
      weekGrowth: parseFloat(weekGrowth),
    };
  }, [bookings]);

  // Ya no necesitamos filteredBookings porque el filtrado se hace en el backend
  // Pero lo mantenemos para compatibilidad con analytics y exportación
  const filteredBookings = useMemo(() => {
    return bookings;
  }, [bookings]);
  
  // Función para manejar cambio de estado inline
  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      const response = await bookingsAPI.update(id, { status });
      if (response.success) {
        // Recargar datos después de actualizar
        loadData();
      } else {
        alert('Error al actualizar el estado: ' + (response.error || 'Error desconocido'));
      }
    } catch (err: any) {
      console.error('Error actualizando estado:', err);
      alert('Error al actualizar el estado: ' + (err.message || 'Error desconocido'));
    }
  }, [loadData]);

  const filteredCircuits = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    return circuits.filter(circuit =>
      query === "" ||
      circuit.name.toLowerCase().includes(query) ||
      circuit.title.toLowerCase().includes(query)
    );
  }, [circuits, debouncedSearchQuery]);

  const filteredTransports = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    return transports.filter(transport =>
      query === "" ||
      transport.name.toLowerCase().includes(query) ||
      transport.type.toLowerCase().includes(query)
    );
  }, [transports, debouncedSearchQuery]);

  const filteredVehicles = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    return vehicles.filter(vehicle =>
      query === "" ||
      vehicle.name.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    );
  }, [vehicles, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--yass-cream)]">
        <LoadingState message="Cargando datos..." fullScreen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      {/* Header mejorado */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona tus servicios y contenido</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 text-gray-700 hover:text-[var(--yass-gold)] transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 rounded-lg hover:bg-red-50 font-medium"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Circuitos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{circuits.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Circuitos</h3>
            <p className="text-xs text-gray-500">{stats.activeCircuits} activos</p>
          </div>

          {/* Transportes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{transports.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Transportes</h3>
            <p className="text-xs text-gray-500">{stats.activeTransports} activos</p>
          </div>

          {/* Vehículos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{vehicles.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Vehículos</h3>
            <p className="text-xs text-gray-500">{stats.activeVehicles} activos</p>
          </div>

          {/* Reservas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-[var(--yass-gold)] to-[var(--yass-gold-light)] p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{bookings.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Reservas</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                {stats.pendingBookings} pendientes
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                {stats.confirmedBookings} confirmadas
              </span>
            </div>
          </div>
        </div>

        {/* Tabs mejorados */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('circuits')}
                className={`px-6 py-4 font-semibold text-sm border-b-3 transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'circuits'
                    ? 'border-[var(--yass-gold)] text-[var(--yass-gold)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Package className="h-5 w-5" />
                Circuitos
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'circuits' ? 'bg-[var(--yass-gold)]/10 text-[var(--yass-gold)]' : 'bg-gray-200 text-gray-600'
                }`}>
                  {circuits.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('transports')}
                className={`px-6 py-4 font-semibold text-sm border-b-3 transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'transports'
                    ? 'border-[var(--yass-gold)] text-[var(--yass-gold)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Truck className="h-5 w-5" />
                Transportes
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'transports' ? 'bg-[var(--yass-gold)]/10 text-[var(--yass-gold)]' : 'bg-gray-200 text-gray-600'
                }`}>
                  {transports.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-6 py-4 font-semibold text-sm border-b-3 transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'vehicles'
                    ? 'border-[var(--yass-gold)] text-[var(--yass-gold)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Car className="h-5 w-5" />
                Vehículos
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'vehicles' ? 'bg-[var(--yass-gold)]/10 text-[var(--yass-gold)]' : 'bg-gray-200 text-gray-600'
                }`}>
                  {vehicles.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-semibold text-sm border-b-3 transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-[var(--yass-gold)] text-[var(--yass-gold)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                Reservas
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'bookings' ? 'bg-[var(--yass-gold)]/10 text-[var(--yass-gold)]' : 'bg-gray-200 text-gray-600'
                }`}>
                  {bookings.length}
                </span>
                {stats.pendingBookings > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-bold animate-pulse">
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorState
              title="Error"
              message={error}
            />
          </div>
        )}

        {/* Content mejorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header con búsqueda y botón añadir */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1 w-full md:w-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                  {activeTab === 'circuits' && 'Circuitos'}
                  {activeTab === 'transports' && 'Transportes'}
                  {activeTab === 'vehicles' && 'Vehículos'}
                  {activeTab === 'bookings' && 'Reservas'}
                  {activeTab === 'analytics' && 'Analytics'}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full">
                {(activeTab === 'bookings' || activeTab === 'circuits' || activeTab === 'transports' || activeTab === 'vehicles') && (
                  <div className="relative flex-1 min-w-[200px] sm:flex-initial sm:min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email, teléfono..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400 w-full"
                    />
                  </div>
                )}
                {activeTab === 'bookings' && (
                  <>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400 min-w-[160px]"
                      style={{
                        color: '#111827',
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Todos los estados</option>
                      <option value="pending" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Pendientes</option>
                      <option value="confirmed" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Confirmadas</option>
                      <option value="cancelled" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Canceladas</option>
                      <option value="completed" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Completadas</option>
                    </select>
                    <select
                      value={serviceTypeFilter}
                      onChange={(e) => {
                        setServiceTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400 min-w-[140px]"
                      style={{
                        color: '#111827',
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Todos los tipos</option>
                      <option value="airport" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Aeropuerto</option>
                      <option value="intercity" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Inter-ciudades</option>
                      <option value="hourly" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Por horas</option>
                      <option value="custom" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Personalizado</option>
                    </select>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400 min-w-[180px]"
                      style={{
                        color: '#111827',
                      }}
                    >
                      <option value="createdAt-desc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Más recientes primero</option>
                      <option value="createdAt-asc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Más antiguas primero</option>
                      <option value="fecha-desc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Fecha descendente</option>
                      <option value="fecha-asc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Fecha ascendente</option>
                      <option value="status-asc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Estado A-Z</option>
                      <option value="status-desc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Estado Z-A</option>
                      <option value="calculatedPrice-desc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Precio mayor</option>
                      <option value="calculatedPrice-asc" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Precio menor</option>
                    </select>
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`px-4 py-2.5 border-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                        showAdvancedFilters
                          ? 'border-[var(--yass-gold)] bg-[var(--yass-gold)]/10 text-[var(--yass-gold)] shadow-md ring-2 ring-[var(--yass-gold)]/20'
                          : 'border-gray-400 bg-gray-50 text-gray-800 hover:border-[var(--yass-gold)]/50 hover:bg-[var(--yass-gold)]/5 hover:text-[var(--yass-gold)]'
                      } focus:ring-2 focus:ring-[var(--yass-gold)] focus:outline-none`}
                    >
                      <Filter className={`h-4 w-4 ${showAdvancedFilters ? 'text-[var(--yass-gold)]' : 'text-gray-600'}`} />
                      <span>Filtros Avanzados</span>
                    </button>
                    {selectedBookings.length > 0 && (
                      <div className="flex gap-2">
                        <select
                          onChange={async (e) => {
                            const status = e.target.value;
                            if (status && status !== '') {
                              try {
                                const response = await bookingsAPI.bulkUpdate(selectedBookings, status);
                                if (response.success) {
                                  setSelectedBookings([]);
                                  loadData();
                                  const modifiedCount = (response.data as any)?.modifiedCount || selectedBookings.length;
                                  alert(`${modifiedCount} reserva(s) actualizada(s)`);
                                }
                              } catch (err) {
                                alert('Error al actualizar reservas');
                              }
                            }
                          }}
                          className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                          style={{
                            color: '#111827',
                          }}
                          defaultValue=""
                        >
                          <option value="" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Acción masiva ({selectedBookings.length})</option>
                          <option value="pending" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Marcar como Pendiente</option>
                          <option value="confirmed" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Marcar como Confirmada</option>
                          <option value="cancelled" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Marcar como Cancelada</option>
                          <option value="completed" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '8px' }}>Marcar como Completada</option>
                        </select>
                        <button
                          onClick={() => setSelectedBookings([])}
                          className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => exportToCSV(filteredBookings)}
                      className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      <FileText className="h-4 w-4" />
                      Exportar CSV
                    </button>
                  </>
                )}
                {activeTab !== 'bookings' && activeTab !== 'analytics' && (
                  <Link
                    href={`/admin/${activeTab}/nuevo`}
                    className="bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 justify-center"
                  >
                    <Plus className="h-5 w-5" />
                    Añadir Nuevo
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Lista de elementos mejorada */}
          <div className="p-6">
            <div className="space-y-4">
              {activeTab === 'circuits' && (
                <>
                  {filteredCircuits.length === 0 ? (
                    <EmptyState
                      icon="map"
                      message={searchQuery ? "No se encontraron circuitos" : "No hay circuitos registrados"}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredCircuits.map((circuit) => (
                        <CircuitCard
                          key={circuit._id}
                          circuit={circuit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'transports' && (
                <>
                  {filteredTransports.length === 0 ? (
                    <EmptyState
                      icon="route"
                      message={searchQuery ? "No se encontraron transportes" : "No hay transportes registrados"}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredTransports.map((transport) => (
                        <TransportCard
                          key={transport._id}
                          transport={transport}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'vehicles' && (
                <>
                  {filteredVehicles.length === 0 ? (
                    <EmptyState
                      icon="car"
                      message={searchQuery ? "No se encontraron vehículos" : "No hay vehículos registrados"}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                          key={vehicle._id}
                          vehicle={vehicle}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'bookings' && (
                <>
                  {/* Filtros avanzados */}
                  {showAdvancedFilters && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-[var(--yass-gold)]/20 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Filter className="h-5 w-5 text-[var(--yass-gold)]" />
                          Filtros Avanzados
                        </h3>
                        <button
                          onClick={() => {
                            setDateFrom('');
                            setDateTo('');
                            setMinPrice('');
                            setMaxPrice('');
                            setCurrentPage(1);
                          }}
                          className="text-sm text-gray-600 hover:text-[var(--yass-gold)] font-medium transition-colors underline"
                        >
                          Limpiar todo
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Desde</label>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                              setDateFrom(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Hasta</label>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                              setDateTo(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Mínimo (MAD)</label>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(e.target.value);
                              setCurrentPage(1);
                            }}
                            placeholder="0"
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Máximo (MAD)</label>
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(e.target.value);
                              setCurrentPage(1);
                            }}
                            placeholder="10000"
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all hover:border-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {bookings.length === 0 ? (
                    <EmptyState
                      icon="calendar"
                      message={searchQuery || statusFilter !== "all" || serviceTypeFilter !== "all" ? "No se encontraron reservas" : "No hay reservas registradas"}
                    />
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Mostrando {bookings.length} de {totalBookings} reservas
                        </p>
                        {selectedBookings.length > 0 && (
                          <p className="text-sm font-semibold text-[var(--yass-gold)]">
                            {selectedBookings.length} seleccionada(s)
                          </p>
                        )}
                      </div>
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <BookingCard
                            key={booking._id}
                            booking={booking}
                            onStatusChange={handleStatusChange}
                            selected={selectedBookings.includes(booking._id)}
                            onSelect={(id, checked) => {
                              if (checked) {
                                setSelectedBookings([...selectedBookings, id]);
                              } else {
                                setSelectedBookings(selectedBookings.filter(bid => bid !== id));
                              }
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Paginación */}
                      {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard analytics={analytics || computedAnalytics} stats={stats} bookings={bookings} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes memoizados para evitar re-renders innecesarios
const CircuitCard = memo(({ circuit, onDelete }: { circuit: Circuit; onDelete: (type: 'circuits', id: string) => void }) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-[var(--yass-gold)]/50 hover:shadow-lg transition-all duration-300 bg-white group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--yass-gold)] transition-colors">
              {circuit.name}
            </h3>
            {circuit.featured && (
              <span className="px-2 py-1 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white text-xs font-bold rounded-full">
                Destacado
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{circuit.title}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {circuit.duration}
            </span>
            <span className="text-gray-500 font-semibold">
              {circuit.price}€
            </span>
            {circuit.active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link
          href={`/admin/circuits/editar/${circuit._id}`}
          className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Link>
        <button
          onClick={() => onDelete('circuits', circuit._id)}
          className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
});

CircuitCard.displayName = 'CircuitCard';

const TransportCard = memo(({ transport, onDelete }: { transport: Transport; onDelete: (type: 'transports', id: string) => void }) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-[var(--yass-gold)]/50 hover:shadow-lg transition-all duration-300 bg-white group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[var(--yass-gold)] transition-colors">
            {transport.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{transport.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {transport.type}
            </span>
            <span className="text-gray-500 font-semibold">
              {transport.price}€
            </span>
            {transport.active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link
          href={`/admin/transports/editar/${transport._id}`}
          className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Link>
        <button
          onClick={() => onDelete('transports', transport._id)}
          className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
});

TransportCard.displayName = 'TransportCard';

const VehicleCard = memo(({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: (type: 'vehicles', id: string) => void }) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-[var(--yass-gold)]/50 hover:shadow-lg transition-all duration-300 bg-white group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[var(--yass-gold)] transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vehicle.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {(() => {
                const VehicleIcon = getVehicleIcon(vehicle.type);
                return (
                  <>
                    <VehicleIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {vehicle.type}
                  </>
                );
              })()}
            </span>
            {vehicle.active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link
          href={`/admin/vehicles/editar/${vehicle._id}`}
          className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Link>
        <button
          onClick={() => onDelete('vehicles', vehicle._id)}
          className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
});

VehicleCard.displayName = 'VehicleCard';

const BookingCard = memo(({ booking, onStatusChange, selected, onSelect }: { 
  booking: any; 
  onStatusChange?: (id: string, status: string) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}) => {
  const router = useRouter();
  
  const handleViewDetails = () => {
    router.push(`/admin/bookings/detalles?id=${booking._id}`);
  };

  const handleStatusChangeLocal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (onStatusChange && booking._id) {
      onStatusChange(booking._id, newStatus);
    }
  };

  // Colores según el tipo de servicio
  const serviceColors = useMemo(() => {
    const serviceType = booking.serviceType || 'custom';
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      airport: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
      },
      intercity: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
      },
      hourly: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
      },
      custom: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
      },
    };
    return colorMap[serviceType] || colorMap.custom;
  }, [booking.serviceType]);

  return (
    <div className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white group ${
      selected ? 'border-[var(--yass-gold)] bg-[var(--yass-gold)]/5' : 'border-gray-200 hover:border-[var(--yass-gold)]/50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Checkbox para selección masiva */}
            {onSelect && (
              <input
                type="checkbox"
                checked={selected || false}
                onChange={(e) => onSelect(booking._id, e.target.checked)}
                className="w-5 h-5 text-[var(--yass-gold)] border-gray-300 rounded focus:ring-[var(--yass-gold)] cursor-pointer"
              />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-[var(--yass-gold)] transition-colors">
                {booking.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{booking.email}</span>
                {booking.telefono && (
                  <>
                    <Phone className="h-4 w-4 text-gray-400 ml-3" />
                    <span className="text-sm text-gray-600">{booking.telefono}</span>
                  </>
                )}
              </div>
            </div>
            {/* Selector de estado inline */}
            {onStatusChange && (
              <select
                value={booking.status || 'pending'}
                onChange={handleStatusChangeLocal}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                } cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--yass-gold)]`}
              >
                <option value="pending">⏳ Pendiente</option>
                <option value="confirmed">✓ Confirmada</option>
                <option value="cancelled">✗ Cancelada</option>
                <option value="completed">✓ Completada</option>
              </select>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className={`${serviceColors.bg} rounded-lg p-3 border ${serviceColors.border}`}>
              <p className={`text-xs ${serviceColors.text} mb-1 font-semibold`}>Servicio</p>
              <p className={`font-semibold ${serviceColors.text}`}>{booking.serviceName}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{booking.serviceType}</p>
            </div>
            {booking.fecha && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha
                </p>
                <p className="font-semibold text-gray-900">{booking.fecha}</p>
              </div>
            )}
            {booking.hora && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Hora
                </p>
                <p className="font-semibold text-gray-900">{booking.hora}</p>
              </div>
            )}
            {booking.pasajeros && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Pasajeros
                </p>
                <p className="font-semibold text-gray-900">{booking.pasajeros}</p>
              </div>
            )}
          </div>
          {booking.priceLabel && (
            <div className="mt-3 p-3 bg-gradient-to-r from-[var(--yass-gold)]/10 to-[var(--yass-gold-light)]/10 rounded-lg">
              <p className="text-sm text-gray-600">Precio:</p>
              <p className="text-lg font-bold text-[var(--yass-gold)]">{booking.priceLabel}</p>
            </div>
          )}
          {booking.reservationNumber && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Número de Reserva:</span>
              <span className="px-3 py-1 bg-[var(--yass-gold)] text-white rounded-lg font-bold text-sm">
                {booking.reservationNumber}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
        <button
          onClick={handleViewDetails}
          className="flex-1 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver Detalles
        </button>
      </div>
    </div>
  );
});

BookingCard.displayName = 'BookingCard';

// Función para exportar a CSV
const exportToCSV = (bookings: any[]) => {
  const headers = ['Nombre', 'Email', 'Teléfono', 'Servicio', 'Tipo', 'Fecha', 'Hora', 'Pasajeros', 'Estado', 'Precio', 'Número Reserva'];
  const rows = bookings.map(booking => [
    booking.nombre || '',
    booking.email || '',
    booking.telefono || '',
    booking.serviceName || '',
    booking.serviceType || '',
    booking.fecha || '',
    booking.hora || '',
    booking.pasajeros || '',
    booking.status || '',
    booking.priceLabel || booking.calculatedPrice || '',
    booking.reservationNumber || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Componente de Analytics Dashboard
const AnalyticsDashboard = memo(({ analytics, stats, bookings }: { 
  analytics: any; 
  stats: any; 
  bookings: any[] 
}) => {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando estadísticas...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Usar datos de la API si están disponibles, sino usar datos calculados localmente
  // Transformar bookingsByMonth del backend a formato esperado
  let monthlyData: any[] = [];
  if (analytics?.bookingsByMonth && Array.isArray(analytics.bookingsByMonth)) {
    monthlyData = analytics.bookingsByMonth.map((item: any) => {
      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const monthName = item._id?.month ? monthNames[item._id.month - 1] : 'N/A';
      const year = item._id?.year || new Date().getFullYear();
      return {
        month: `${monthName} ${year}`,
        count: item.count || 0,
        revenue: item.revenue || 0,
      };
    });
  } else if (analytics?.monthlyData && Array.isArray(analytics.monthlyData)) {
    monthlyData = analytics.monthlyData;
  }
  
  const bookingsByServiceType = analytics?.bookingsByType?.reduce((acc: any, item: any) => {
    acc[item._id] = item.count;
    return acc;
  }, {}) || analytics?.bookingsByServiceType || {};
  
  const popularServices = analytics?.recentBookings?.slice(0, 5).map((b: any) => ({
    name: b.serviceName,
    count: 1
  })) || analytics?.popularServices || [];

  // Calcular altura máxima para gráficos de barras
  const maxMonthlyCount = monthlyData && monthlyData.length > 0 
    ? Math.max(...monthlyData.map((m: any) => m.count || 0), 1)
    : 1;
  const maxMonthlyRevenue = monthlyData && monthlyData.length > 0
    ? Math.max(...monthlyData.map((m: any) => m.revenue || 0), 1)
    : 1;
  const maxServiceType = Object.keys(bookingsByServiceType).length > 0
    ? Math.max(...Object.values(bookingsByServiceType).map((v: any) => typeof v === 'number' ? v : 0), 1)
    : 1;
  const maxPopularService = popularServices && popularServices.length > 0 
    ? Math.max(...popularServices.map((s: any) => s.count || 1), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reservas */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 opacity-80" />
            {analytics.bookings?.growth && parseFloat(analytics.bookings.growth) > 0 ? (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                <ArrowUp className="h-3 w-3" />
                {Math.abs(parseFloat(analytics.bookings.growth))}%
              </div>
            ) : analytics.bookings?.growth && parseFloat(analytics.bookings.growth) < 0 ? (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                <ArrowDown className="h-3 w-3" />
                {Math.abs(parseFloat(analytics.bookings.growth))}%
              </div>
            ) : null}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Reservas</h3>
          <p className="text-3xl font-bold">{analytics.bookings?.total || analytics.totalBookings || 0}</p>
          <p className="text-xs opacity-75 mt-2">
            {analytics.bookings?.thisMonth || analytics.thisWeekBookings || 0} este mes
          </p>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Ingresos Totales</h3>
          <p className="text-3xl font-bold">{formatCurrency((analytics.revenue?.total || 0) / 11)}</p>
          <p className="text-xs opacity-75 mt-2">
            {formatMAD(analytics.revenue?.total || 0)} MAD
          </p>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 opacity-80" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Tasa de Conversión</h3>
          <p className="text-3xl font-bold">
            {analytics.bookings?.total > 0 
              ? ((analytics.bookings.confirmed / analytics.bookings.total) * 100).toFixed(1)
              : analytics.conversionRate || '0'}%
          </p>
          <p className="text-xs opacity-75 mt-2">
            {analytics.bookings?.confirmed || stats.confirmedBookings} de {analytics.bookings?.total || analytics.totalBookings || 0} confirmadas
          </p>
        </div>

        {/* Promedio por Reserva */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Promedio/Reserva</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(
              analytics.revenue?.thisMonth && analytics.bookings?.confirmed 
                ? (analytics.revenue.thisMonth / analytics.bookings.confirmed) / 11
                : parseFloat(analytics.avgRevenuePerBooking || '0') / 11
            )}
          </p>
          <p className="text-xs opacity-75 mt-2">
            {formatMAD(
              analytics.revenue?.thisMonth && analytics.bookings?.confirmed
                ? analytics.revenue.thisMonth / analytics.bookings.confirmed
                : parseFloat(analytics.avgRevenuePerBooking || '0')
            )} MAD
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas por Mes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[var(--yass-gold)]" />
            Reservas por Mes (Últimos 6 meses)
          </h3>
          <div className="space-y-4">
            {monthlyData && monthlyData.length > 0 ? monthlyData.map((month: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 capitalize">{month.month || 'N/A'}</span>
                  <span className="font-bold text-gray-900">{month.count || 0} reservas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((month.count || 0) / maxMonthlyCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Ingresos por Mes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Ingresos por Mes (Últimos 6 meses)
          </h3>
          <div className="space-y-4">
            {monthlyData && monthlyData.length > 0 ? monthlyData.map((month: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 capitalize">{month.month || 'N/A'}</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency((month.revenue || 0) / 11)} ({formatMAD(month.revenue || 0)} MAD)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((month.revenue || 0) / maxMonthlyRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Reservas por Tipo de Servicio */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Reservas por Tipo de Servicio
          </h3>
          <div className="space-y-4">
            {Object.keys(bookingsByServiceType).length > 0 ? Object.entries(bookingsByServiceType).map(([type, count]: [string, any]) => {
              const typeLabels: Record<string, string> = {
                airport: 'Aeropuerto',
                intercity: 'Inter-ciudades',
                hourly: 'Por hora',
                custom: 'Personalizado',
              };
              const typeColors: Record<string, string> = {
                airport: 'from-blue-500 to-cyan-500',
                intercity: 'from-purple-500 to-pink-500',
                hourly: 'from-green-500 to-emerald-500',
                custom: 'from-orange-500 to-red-500',
              };
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{typeLabels[type] || type}</span>
                    <span className="font-bold text-gray-900">{count} reservas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${typeColors[type] || 'from-gray-500 to-gray-600'} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(count / maxServiceType) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Servicios Más Solicitados */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Servicios Más Solicitados
          </h3>
          {popularServices && popularServices.length > 0 ? (
            <div className="space-y-4">
              {popularServices.map((service: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700 truncate pr-2">{service.name}</span>
                    <span className="font-bold text-gray-900 flex-shrink-0">{service.count} reservas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((service.count || 1) / maxPopularService) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Estadísticas de Estado */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-600" />
          Distribución por Estado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-xl p-5 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">Pendientes</h4>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            <p className="text-sm text-gray-600 mt-1">
              {(analytics.bookings?.total || analytics.totalBookings || 0) > 0 
                ? `${((stats.pendingBookings / (analytics.bookings?.total || analytics.totalBookings || 1)) * 100).toFixed(1)}% del total`
                : '0%'}
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-gray-900">Confirmadas</h4>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
            <p className="text-sm text-gray-600 mt-1">
              {(analytics.bookings?.total || analytics.totalBookings || 0) > 0 
                ? `${((stats.confirmedBookings / (analytics.bookings?.total || analytics.totalBookings || 1)) * 100).toFixed(1)}% del total`
                : '0%'}
            </p>
          </div>

          <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <h4 className="font-semibold text-gray-900">Canceladas</h4>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.cancelledBookings}</p>
            <p className="text-sm text-gray-600 mt-1">
              {(analytics.bookings?.total || analytics.totalBookings || 0) > 0 
                ? `${((stats.cancelledBookings / (analytics.bookings?.total || analytics.totalBookings || 1)) * 100).toFixed(1)}% del total`
                : '0%'}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Completadas</h4>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {(analytics.bookings?.total || analytics.totalBookings || 0) > 0 
                ? `${((bookings.filter(b => b.status === 'completed').length / (analytics.bookings?.total || analytics.totalBookings || 1)) * 100).toFixed(1)}% del total`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';
