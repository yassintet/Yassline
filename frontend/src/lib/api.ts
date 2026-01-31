// Configuración y utilidades para llamadas a la API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field?: string; msg?: string; message?: string }>;
  total?: number;
  page?: number;
  totalPages?: number;
  count?: number;
}

// Función genérica para hacer peticiones
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`🌐 fetchAPI: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`📡 fetchAPI: Status ${response.status} ${response.statusText}`);
    console.log(`📡 fetchAPI: Response OK: ${response.ok}`);

    // Manejar errores 403 específicamente
    if (response.status === 403) {
      let errorData;
      try {
        const responseText = await response.text();
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch {
        errorData = {};
      }
      
      // Solo loggear errores 403 si no es un caso esperado (token expirado en endpoints de notificaciones)
      const isExpected403 = endpoint.includes('/notifications') && 
                           (errorData.message?.includes('expirado') || errorData.message?.includes('inválido'));
      
      if (!isExpected403) {
        console.error('❌ fetchAPI: Error 403 (Forbidden):', {
          endpoint,
          message: errorData.message || errorData.error,
          hasAuthHeader: !!(options.headers as Record<string, string>)?.['Authorization'],
        });
      }
      
      return {
        success: false,
        error: errorData.message || errorData.error || 'Acceso denegado. Token inválido o expirado.',
        message: errorData.message || 'Acceso denegado',
      };
    }

    let data;
    let responseText;
    try {
      responseText = await response.text();
      console.log(`📡 fetchAPI: Response text:`, responseText.substring(0, 500));
      data = responseText ? JSON.parse(responseText) : {};
      console.log(`📡 fetchAPI: Parsed data:`, JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ fetchAPI: Error parseando JSON:', parseError);
      console.error('❌ fetchAPI: Response text:', responseText);
      // Si no se puede parsear como JSON, devolver error
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}. Respuesta no válida del servidor: ${responseText?.substring(0, 200) || 'vacía'}`,
        message: `Error ${response.status}`,
      };
    }

    if (!response.ok) {
      console.log(`❌ fetchAPI: Response not OK, returning error`);
      return {
        success: false,
        error: data.message || data.error || `Error ${response.status}: ${response.statusText}`,
        errors: data.errors, // Incluir errores de validación si existen
        message: data.message,
      };
    }

    // Si la respuesta del servidor ya tiene estructura { success, data }, usar esa estructura
    if (data.success !== undefined) {
      console.log(`✅ fetchAPI: Response has success field: ${data.success}`);
      // Para respuestas paginadas, incluir también total, page, totalPages
      return {
        success: data.success,
        data: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        count: data.count,
        error: data.error,
        errors: data.errors,
        message: data.message,
      };
    }

    // Si la respuesta tiene data, extraerlo
    const responseData = data.data !== undefined ? data.data : data;
    console.log(`✅ fetchAPI: Returning success with data`);

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('❌ fetchAPI: Exception:', error);
    console.error('❌ fetchAPI: Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Manejar errores de red específicamente
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Error de conexión. Verifica que el backend esté corriendo en ' + API_URL,
        message: 'No se pudo conectar con el servidor',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// API de Circuitos
export const circuitsAPI = {
  getAll: () => fetchAPI('/api/circuits'),
  getBySlug: (slug: string) => fetchAPI(`/api/circuits/slug/${slug}`),
  getFeatured: () => fetchAPI('/api/circuits?featured=true'),
  getById: (id: string) => fetchAPI(`/api/circuits/${id}`),
  create: (data: any) => fetchAuthenticatedAPI('/api/circuits', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAuthenticatedAPI(`/api/circuits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAuthenticatedAPI(`/api/circuits/${id}`, {
    method: 'DELETE',
  }),
};

// API de Transportes
export const transportsAPI = {
  getAll: () => fetchAPI('/api/transport'),
  getByType: (type: string) => fetchAPI(`/api/transport?type=${type}`),
  getById: (id: string) => fetchAPI(`/api/transport/${id}`),
  create: (data: any) => fetchAuthenticatedAPI('/api/transport', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAuthenticatedAPI(`/api/transport/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAuthenticatedAPI(`/api/transport/${id}`, {
    method: 'DELETE',
  }),
};

// API de Vehículos
export const vehiclesAPI = {
  getAll: () => fetchAPI('/api/vehicles'),
  getByType: (type: string) => fetchAPI(`/api/vehicles?type=${type}`),
  getById: (id: string) => fetchAPI(`/api/vehicles/${id}`),
  create: (data: any) => fetchAuthenticatedAPI('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAuthenticatedAPI(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAuthenticatedAPI(`/api/vehicles/${id}`, {
    method: 'DELETE',
  }),
};

// API de Autenticación
export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (username: string, email: string, password: string) => {
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
  forgotPassword: async (email: string) => {
    return fetchAPI('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (token: string, newPassword: string) => {
    return fetchAPI('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
  logout: () => {
    // Limpiar token del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// API de Contacto
export const contactAPI = {
  send: async (data: {
    nombre: string;
    email: string;
    telefono?: string;
    servicio?: string;
    mensaje: string;
  }) => {
    return fetchAPI('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// API de Usuarios
export const userAPI = {
  getProfile: () => fetchAuthenticatedAPI<{
    user: any;
    stats: {
      totalBookings: number;
      confirmedBookings: number;
      completedBookings: number;
      totalFavorites: number;
      unreadNotifications: number;
    };
    nextLevel: {
      level: string;
      pointsNeeded: number;
      madNeeded: number;
    } | null;
  }>('/api/users/profile'),
  getPointsHistory: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/users/points-history${queryString ? `?${queryString}` : ''}`);
  },
  getFavorites: () => fetchAuthenticatedAPI<any[]>('/api/users/favorites'),
  addFavorite: (serviceType: string, serviceId: string) => fetchAuthenticatedAPI('/api/users/favorites', {
    method: 'POST',
    body: JSON.stringify({ serviceType, serviceId }),
  }),
  removeFavorite: (id: string) => fetchAuthenticatedAPI(`/api/users/favorites/${id}`, { method: 'DELETE' }),
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/users/notifications${queryString ? `?${queryString}` : ''}`);
  },
  markNotificationRead: (id: string) => fetchAuthenticatedAPI(`/api/users/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchAuthenticatedAPI('/api/users/notifications/read-all', { method: 'PUT' }),
  updateProfile: (data: { nombre?: string; email?: string; telefono?: string }) => fetchAuthenticatedAPI('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (currentPassword: string, newPassword: string) => fetchAuthenticatedAPI('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
};

// API de Búsqueda
export const searchAPI = {
  global: (query: string, type?: string, limit?: number) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);
    if (limit) params.append('limit', String(limit));
    return fetchAPI(`/api/search?${params.toString()}`);
  },
};

// API de Analytics (Admin)
export const analyticsAPI = {
  getDashboardStats: () => fetchAuthenticatedAPI('/api/analytics/dashboard'),
};

// API de Reservas (Bookings)
export const bookingsAPI = {
  getMy: (params?: {
    status?: string;
    serviceType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/bookings/my${queryString ? `?${queryString}` : ''}`);
  },
  create: async (data: {
    nombre: string;
    email: string;
    telefono?: string;
    serviceName: string;
    serviceType: string;
    serviceId?: string;
    fecha?: string;
    hora?: string;
    pasajeros?: number;
    priceLabel?: string;
    calculatedPrice?: number;
    details?: string;
    mensaje?: string;
    customData?: any;
    airportData?: any;
    routeData?: {
      from?: string;
      to?: string;
    };
  }) => {
    // Si el usuario está autenticado, usar fetchAuthenticatedAPI para asociar la reserva
    const token = getAuthToken();
    if (token) {
      return fetchAuthenticatedAPI('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    // Si no está autenticado, usar fetchAPI normal (ruta pública)
    return fetchAPI('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: (params?: {
    status?: string;
    serviceType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/bookings${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id: string) => fetchAuthenticatedAPI(`/api/bookings/${id}`),
  /** Obtener reserva para la página de pago (sin auth, para usuarios que acaban de reservar) */
  getByIdForPayment: (id: string) => fetchAPI(`/api/bookings/${id}/for-payment`),
  update: (id: string, data: any) => fetchAuthenticatedAPI(`/api/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  bulkUpdate: (ids: string[], status: string) => fetchAuthenticatedAPI('/api/bookings/bulk', {
    method: 'PUT',
    body: JSON.stringify({ ids, status }),
  }),
  confirm: (id: string, data?: { total?: number }) => fetchAuthenticatedAPI(`/api/bookings/${id}/confirm`, {
    method: 'PUT',
    body: JSON.stringify(data || {}),
  }),
  delete: (id: string) => fetchAuthenticatedAPI(`/api/bookings/${id}`, {
    method: 'DELETE',
  }),
};

// API de puntos y recompensas
export const pointsAPI = {
  getMy: () => fetchAuthenticatedAPI<{
    points: number;
    totalSpent: number;
    totalBookings: number;
    membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamante';
  }>('/api/points/me'),
  getHistory: () => fetchAuthenticatedAPI<any[]>('/api/points/history'),
  getAvailableRewards: () => fetchAuthenticatedAPI<Array<{
    _id: string;
    name: string;
    nameEs: string;
    nameEn: string;
    nameFr: string;
    description: string;
    descriptionEs: string;
    descriptionEn: string;
    descriptionFr: string;
    pointsRequired: number;
    type: 'discount' | 'service' | 'upgrade' | 'gift';
    discountPercent?: number;
    discountAmount?: number;
    serviceType?: string;
    image?: string;
  }>>('/api/points/rewards'),
  getMyRewards: () => fetchAuthenticatedAPI<Array<{
    rewardId: any;
    redeemedAt: string;
    used: boolean;
  }>>('/api/points/rewards/my'),
  redeemReward: (rewardId: string) => fetchAuthenticatedAPI(`/api/points/rewards/${rewardId}/redeem`, {
    method: 'POST',
  }),
  seedRewards: () => fetchAuthenticatedAPI('/api/points/admin/seed-rewards', {
    method: 'POST',
  }),
};

// API de Pagos
export const paymentsAPI = {
  create: async (data: {
    bookingId: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'binance' | 'redotpay' | 'moneygram';
    amount: number;
    currency?: 'MAD' | 'EUR' | 'USD' | 'USDT' | 'BTC' | 'ETH';
    paymentDetails?: any;
  }) => {
    // Intentar usar autenticación si está disponible, sino usar API normal
    const token = getAuthToken();
    if (token) {
      return fetchAuthenticatedAPI('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } else {
      return fetchAPI('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },
  getById: (id: string) => {
    const token = getAuthToken();
    if (token) {
      return fetchAuthenticatedAPI(`/api/payments/${id}`);
    } else {
      return fetchAPI(`/api/payments/${id}`);
    }
  },
  getByBooking: (bookingId: string) => {
    const token = getAuthToken();
    if (token) {
      return fetchAuthenticatedAPI(`/api/payments/booking/${bookingId}`);
    } else {
      return fetchAPI(`/api/payments/booking/${bookingId}`);
    }
  },
  getMy: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/payments/my${queryString ? `?${queryString}` : ''}`);
  },
  confirm: (id: string, data?: {
    cash?: {
      receivedBy?: string;
      notes?: string;
    };
    bankTransfer?: {
      reference?: string;
      bankName?: string;
      accountNumber?: string;
      transferDate?: string;
      proofImage?: string;
    };
  }) => {
    return fetchAuthenticatedAPI(`/api/payments/${id}/confirm`, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    });
  },
  verify: (id: string, data?: {
    transactionHash?: string;
    network?: string;
  }) => {
    return fetchAuthenticatedAPI(`/api/payments/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },
  markAsPaid: (id: string, data?: {
    transactionHash?: string;
    reference?: string;
    transferDate?: string;
  }) => {
    return fetchAuthenticatedAPI(`/api/payments/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    });
  },
  getBankInfo: () => {
    return fetchAPI('/api/payments/bank-info');
  },
  getAll: (params?: {
    status?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchAuthenticatedAPI(`/api/payments/admin/all${queryString ? `?${queryString}` : ''}`);
  },
  adminConfirm: (id: string, data?: {
    cash?: {
      receivedBy?: string;
      notes?: string;
    };
    bankTransfer?: {
      reference?: string;
      bankName?: string;
      accountNumber?: string;
      transferDate?: string;
      proofImage?: string;
    };
  }) => {
    return fetchAuthenticatedAPI(`/api/payments/${id}/admin-confirm`, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    });
  },
};

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No hay token de autenticación en localStorage');
  }
  return token;
};

// Función para hacer peticiones autenticadas
export async function fetchAuthenticatedAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  if (!token) {
    console.error('❌ No se puede hacer petición autenticada: token no encontrado');
    return {
      success: false,
      error: 'No estás autenticado. Por favor, inicia sesión.',
    };
  }
  
  try {
    return await fetchAPI<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Si fetchAPI lanza una excepción (no debería, pero por si acaso)
    console.error('❌ fetchAuthenticatedAPI: Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al hacer petición autenticada',
    };
  }
}

export default API_URL;
