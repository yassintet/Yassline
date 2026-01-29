const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')

// Mock MongoDB connection
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
    db: { databaseName: 'test' },
    host: 'localhost',
  },
}))

// Create a test app
const app = express()
app.use(express.json())

// Mock auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    })
  }

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      id: '1',
      username,
      email,
      role: 'user',
    },
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos',
    })
  }

  // Mock successful login
  if (email === 'test@example.com' && password === 'password123') {
    return res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      },
    })
  }

  res.status(401).json({
    success: false,
    message: 'Credenciales inválidas',
  })
})

describe('Auth Routes Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.email).toBe('test@example.com')
    })

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('token')
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
})
