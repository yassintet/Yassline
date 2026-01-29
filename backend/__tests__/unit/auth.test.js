const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

describe('Authentication Utilities', () => {
  describe('JWT Token', () => {
    it('should generate a valid JWT token', () => {
      const secret = process.env.JWT_SECRET || 'test-secret'
      const payload = { id: '1', email: 'test@example.com', role: 'admin' }
      
      const token = jwt.sign(payload, secret, { expiresIn: '24h' })
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      
      const decoded = jwt.verify(token, secret)
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
    })

    it('should verify a valid JWT token', () => {
      const secret = process.env.JWT_SECRET || 'test-secret'
      const payload = { id: '1', email: 'test@example.com' }
      const token = jwt.sign(payload, secret)
      
      const decoded = jwt.verify(token, secret)
      expect(decoded.id).toBe(payload.id)
    })

    it('should reject an invalid JWT token', () => {
      const secret = process.env.JWT_SECRET || 'test-secret'
      const invalidToken = 'invalid.token.here'
      
      expect(() => {
        jwt.verify(invalidToken, secret)
      }).toThrow()
    })
  })

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hash = await bcrypt.hash(password, 10)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20)
    })

    it('should verify a correct password', async () => {
      const password = 'testpassword123'
      const hash = await bcrypt.hash(password, 10)
      
      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hash = await bcrypt.hash(password, 10)
      
      const isValid = await bcrypt.compare(wrongPassword, hash)
      expect(isValid).toBe(false)
    })
  })
})
