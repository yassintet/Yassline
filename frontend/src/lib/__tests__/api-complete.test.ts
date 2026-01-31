import {
  circuitsAPI,
  transportsAPI,
  vehiclesAPI,
  bookingsAPI,
  authAPI,
  getAuthToken,
  fetchAuthenticatedAPI,
} from '../api'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('circuitsAPI', () => {
    it('should get all circuits', async () => {
      const mockData = [{ id: '1', name: 'Circuit 1' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await circuitsAPI.getAll()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should get circuit by slug', async () => {
      const mockData = { id: '1', name: 'Circuit 1', slug: 'circuit-1' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await circuitsAPI.getBySlug('circuit-1')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should create circuit with authentication', async () => {
      localStorageMock.setItem('token', 'test-token')
      const circuitData = { name: 'New Circuit', price: 1000 }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...circuitData } }),
      } as Response)

      const result = await circuitsAPI.create(circuitData)
      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/circuits'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })
  })

  describe('transportsAPI', () => {
    it('should get all transports', async () => {
      const mockData = [{ id: '1', type: 'airport' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await transportsAPI.getAll()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should get transports by type', async () => {
      const mockData = [{ id: '1', type: 'airport' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await transportsAPI.getByType('airport')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transport?type=airport'),
        expect.any(Object)
      )
    })
  })

  describe('vehiclesAPI', () => {
    it('should get all vehicles', async () => {
      const mockData = [{ id: '1', name: 'Mercedes V-Class' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await vehiclesAPI.getAll()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })
  })

  describe('bookingsAPI', () => {
    it('should create booking', async () => {
      const bookingData = {
        nombre: 'Test User',
        email: 'test@example.com',
        serviceName: 'Airport Transfer',
        serviceType: 'airport',
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...bookingData } }),
      } as Response)

      const result = await bookingsAPI.create(bookingData)
      expect(result.success).toBe(true)
    })

    it('should get all bookings with authentication', async () => {
      localStorageMock.setItem('token', 'test-token')
      const mockData = [{ id: '1', serviceName: 'Airport Transfer' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      } as Response)

      const result = await bookingsAPI.getAll()
      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bookings'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should confirm booking', async () => {
      localStorageMock.setItem('token', 'test-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', status: 'confirmed' } }),
      } as Response)

      const result = await bookingsAPI.confirm('1', { total: 1000 })
      expect(result.success).toBe(true)
    })
  })

  describe('authAPI', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true,
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com' },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await authAPI.login('test@example.com', 'password')
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('token')
    })

    it('should register successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', username: 'testuser', email: 'test@example.com' },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await authAPI.register('testuser', 'test@example.com', 'password')
      expect(result.success).toBe(true)
    })

    it('should logout and clear localStorage', () => {
      localStorageMock.setItem('token', 'test-token')
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }))

      authAPI.logout()

      expect(localStorageMock.getItem('token')).toBeNull()
      expect(localStorageMock.getItem('user')).toBeNull()
    })
  })

  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.setItem('token', 'test-token')
      expect(getAuthToken()).toBe('test-token')
    })

    it('should return null if token does not exist', () => {
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('fetchAuthenticatedAPI', () => {
    it('should include Authorization header when token exists', async () => {
      localStorageMock.setItem('token', 'test-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      await fetchAuthenticatedAPI('/api/test')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should work without token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      await fetchAuthenticatedAPI('/api/test')
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
