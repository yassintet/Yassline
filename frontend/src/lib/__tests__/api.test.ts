import { contactAPI } from '../api'

// Mock fetch
global.fetch = jest.fn()

describe('contactAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('send', () => {
    it('should send contact form successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Mensaje enviado exitosamente',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const formData = {
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '+212 669 215 611',
        servicio: 'transporte',
        mensaje: 'Test message',
      }

      const result = await contactAPI.send(formData)

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Error al enviar mensaje',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      })

      const formData = {
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '+212 669 215 611',
        servicio: 'transporte',
        mensaje: 'Test message',
      }

      const result = await contactAPI.send(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const formData = {
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '+212 669 215 611',
        servicio: 'transporte',
        mensaje: 'Test message',
      }

      const result = await contactAPI.send(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
