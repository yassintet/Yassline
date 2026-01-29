const request = require('supertest')
const express = require('express')

const app = express()
app.use(express.json())

const mockContacts = []

app.post('/api/contact', (req, res) => {
  const { nombre, email, mensaje } = req.body

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido',
    })
  }

  const newContact = {
    _id: String(mockContacts.length + 1),
    ...req.body,
    createdAt: new Date(),
  }

  mockContacts.push(newContact)
  res.status(201).json({
    success: true,
    message: 'Mensaje enviado exitosamente',
    data: newContact,
  })
})

describe('Contact Routes Integration Tests', () => {
  beforeEach(() => {
    mockContacts.length = 0
  })

  describe('POST /api/contact', () => {
    it('should create contact successfully', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          telefono: '+212 669 215 611',
          servicio: 'transporte',
          mensaje: 'Test message',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.nombre).toBe('Test User')
      expect(response.body.data.email).toBe('test@example.com')
    })

    it('should reject contact with missing required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('requeridos')
    })

    it('should reject contact with invalid email', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'invalid-email',
          mensaje: 'Test message',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Email inválido')
    })

    it('should accept contact with optional fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          mensaje: 'Test message',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
    })
  })
})
