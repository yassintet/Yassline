const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const mockBookings = [
  {
    _id: '1',
    nombre: 'Test User',
    email: 'test@example.com',
    serviceName: 'Airport Transfer',
    serviceType: 'airport',
    status: 'pending',
  },
]

app.post('/api/bookings', (req, res) => {
  const { nombre, email, serviceName, serviceType } = req.body

  if (!nombre || !email || !serviceName || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    })
  }

  const newBooking = {
    _id: String(mockBookings.length + 1),
    ...req.body,
    status: 'pending',
    createdAt: new Date(),
  }

  mockBookings.push(newBooking)
  res.status(201).json({ success: true, data: newBooking })
})

app.get('/api/bookings', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, 'test-secret')
    res.json({ success: true, data: mockBookings })
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid token' })
  }
})

app.put('/api/bookings/:id/confirm', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, 'test-secret')
    const booking = mockBookings.find(b => b._id === req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    booking.status = 'confirmed'
    if (req.body.total) {
      booking.total = req.body.total
    }

    res.json({ success: true, data: booking })
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid token' })
  }
})

describe('Booking Routes Integration Tests', () => {
  const validToken = jwt.sign({ id: '1', role: 'admin' }, 'test-secret')

  describe('POST /api/bookings', () => {
    it('should create booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          nombre: 'John Doe',
          email: 'john@example.com',
          serviceName: 'Airport Transfer',
          serviceType: 'airport',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.nombre).toBe('John Doe')
      expect(response.body.data.status).toBe('pending')
    })

    it('should reject booking with missing fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          nombre: 'John Doe',
          email: 'john@example.com',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/bookings', () => {
    it('should return bookings with valid token', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${validToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should reject without token', async () => {
      const response = await request(app).get('/api/bookings')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/bookings/:id/confirm', () => {
    it('should confirm booking with valid token', async () => {
      const response = await request(app)
        .put('/api/bookings/1/confirm')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ total: 1000 })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('confirmed')
      expect(response.body.data.total).toBe(1000)
    })

    it('should reject without token', async () => {
      const response = await request(app)
        .put('/api/bookings/1/confirm')
        .send({ total: 1000 })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
})
