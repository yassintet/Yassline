import { calculateDistance, calculateIntercityPrice } from '../distance'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Distance Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateDistance', () => {
    it('should return null for empty origin', async () => {
      const result = await calculateDistance('', 'Destination')
      expect(result).toBeNull()
    })

    it('should return null for empty destination', async () => {
      const result = await calculateDistance('Origin', '')
      expect(result).toBeNull()
    })

    it('should calculate distance successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          distance: 100,
          price: 150,
          origin: 'Origin',
          destination: 'Destination',
          method: 'google',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await calculateDistance('Origin', 'Destination')
      expect(result).not.toBeNull()
      expect(result?.distance).toBe(100)
      expect(result?.price).toBe(150)
    })

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Invalid request' }),
      } as Response)

      const result = await calculateDistance('Origin', 'Destination')
      expect(result).toBeNull()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const result = await calculateDistance('Origin', 'Destination')
      expect(result).toBeNull()
    })
  })

  describe('calculateIntercityPrice', () => {
    it('should return 0 for invalid distance', () => {
      expect(calculateIntercityPrice(0)).toBe(0)
      expect(calculateIntercityPrice(-10)).toBe(0)
    })

    it('should calculate price for Vito', () => {
      const price = calculateIntercityPrice(100, 'vito', 4)
      expect(price).toBeGreaterThan(0)
      // 100 km * 7 MAD/km * 1.4 (return trip) = 980 MAD
      expect(price).toBeCloseTo(980, 0)
    })

    it('should calculate price for V-Class', () => {
      const price = calculateIntercityPrice(100, 'v-class', 4)
      expect(price).toBeGreaterThan(0)
      // 100 km * 9 MAD/km * 1.4 (return trip) = 1260 MAD
      expect(price).toBeCloseTo(1260, 0)
    })

    it('should apply discount for long distances with few passengers', () => {
      const priceWithoutDiscount = calculateIntercityPrice(250, 'vito', 4)
      // Should apply 35% discount (distance > 220 and passengers < 5)
      expect(priceWithoutDiscount).toBeLessThan(250 * 7 * 1.4)
    })

    it('should use default rate when vehicle type is not specified', () => {
      const price = calculateIntercityPrice(100)
      // Default: 100 km * 1.5 MAD/km = 150 MAD
      expect(price).toBe(150)
    })
  })
})
