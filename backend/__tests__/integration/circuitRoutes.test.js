const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

// Mock circuit routes
const mockCircuits = [
  { _id: '1', name: 'Circuit 1', slug: 'circuit-1', price: 1000 },
  { _id: '2', name: 'Circuit 2', slug: 'circuit-2', price: 2000 },
]

app.get('/api/circuits', (req, res) => {
  const { featured } = req.query
  let circuits = mockCircuits

  if (featured === 'true') {
    circuits = mockCircuits.filter(c => c.featured)
  }

  res.json({ success: true, data: circuits })
})

app.get('/api/circuits/:id', (req, res) => {
  const circuit = mockCircuits.find(c => c._id === req.params.id)
  if (!circuit) {
    return res.status(404).json({ success: false, message: 'Circuit not found' })
  }
  res.json({ success: true, data: circuit })
})

app.get('/api/circuits/slug/:slug', (req, res) => {
  const circuit = mockCircuits.find(c => c.slug === req.params.slug)
  if (!circuit) {
    return res.status(404).json({ success: false, message: 'Circuit not found' })
  }
  res.json({ success: true, data: circuit })
})

app.post('/api/circuits', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, 'test-secret')
    const newCircuit = { _id: '3', ...req.body }
    mockCircuits.push(newCircuit)
    res.status(201).json({ success: true, data: newCircuit })
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid token' })
  }
})

describe('Circuit Routes Integration Tests', () => {
  const validToken = jwt.sign({ id: '1', role: 'admin' }, 'test-secret')

  describe('GET /api/circuits', () => {
    it('should return all circuits', async () => {
      const response = await request(app).get('/api/circuits')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBe(2)
    })

    it('should filter featured circuits', async () => {
      const response = await request(app).get('/api/circuits?featured=true')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/circuits/:id', () => {
    it('should return circuit by id', async () => {
      const response = await request(app).get('/api/circuits/1')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data._id).toBe('1')
    })

    it('should return 404 for non-existent circuit', async () => {
      const response = await request(app).get('/api/circuits/999')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/circuits/slug/:slug', () => {
    it('should return circuit by slug', async () => {
      const response = await request(app).get('/api/circuits/slug/circuit-1')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.slug).toBe('circuit-1')
    })
  })

  describe('POST /api/circuits', () => {
    it('should create circuit with valid token', async () => {
      const response = await request(app)
        .post('/api/circuits')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'New Circuit', price: 1500 })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New Circuit')
    })

    it('should reject without token', async () => {
      const response = await request(app)
        .post('/api/circuits')
        .send({ name: 'New Circuit' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .post('/api/circuits')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'New Circuit' })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })
})
