const jwt = require('jsonwebtoken')
const { authenticateToken, isAdmin } = require('../../middleware/auth')

// Mock Express request, response, next
const createMockReq = (headers = {}) => ({
  headers,
  user: null,
})

const createMockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const createMockNext = () => jest.fn()

describe('Auth Middleware', () => {
  const secret = process.env.JWT_SECRET || 'test-secret'

  describe('authenticateToken', () => {
    it('should call next() with valid token', () => {
      const token = jwt.sign({ id: '1', email: 'test@example.com' }, secret)
      const req = createMockReq({ authorization: `Bearer ${token}` })
      const res = createMockRes()
      const next = createMockNext()

      authenticateToken(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.user).toBeDefined()
      expect(req.user.id).toBe('1')
    })

    it('should return 401 without token', () => {
      const req = createMockReq()
      const res = createMockRes()
      const next = createMockNext()

      authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Token de acceso requerido'),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 with invalid token', () => {
      const req = createMockReq({ authorization: 'Bearer invalid-token' })
      const res = createMockRes()
      const next = createMockNext()

      authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Token inválido'),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('isAdmin', () => {
    it('should call next() for admin user', () => {
      const req = createMockReq()
      req.user = { id: '1', role: 'admin' }
      const res = createMockRes()
      const next = createMockNext()

      isAdmin(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should return 403 for non-admin user', () => {
      const req = createMockReq()
      req.user = { id: '1', role: 'user' }
      const res = createMockRes()
      const next = createMockNext()

      isAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Acceso denegado'),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 when user is not set', () => {
      const req = createMockReq()
      const res = createMockRes()
      const next = createMockNext()

      isAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
