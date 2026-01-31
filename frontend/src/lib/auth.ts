// Utilidades para autenticación

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const authUtils = {
  // Guardar token y usuario
  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Obtener token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Obtener usuario
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return authUtils.getToken() !== null;
  },

  // Verificar si es admin
  isAdmin: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === 'admin';
  },

  // Cerrar sesión
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
