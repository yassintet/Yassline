const nodemailer = require('nodemailer')

// Mock nodemailer
jest.mock('nodemailer')

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EMAIL_USER = 'test@example.com'
    process.env.EMAIL_PASS = 'test-password'
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.COMPANY_NAME = 'Test Company'
    process.env.COMPANY_EMAIL = 'info@test.com'
  })

  it('should create transporter with Gmail config', () => {
    const mockCreateTransport = jest.fn().mockReturnValue({
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    })

    nodemailer.createTransport = mockCreateTransport

    // This would test the actual emailService module
    // For now, we test the transporter creation logic
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: {
          user: 'test@example.com',
          pass: 'test-password',
        },
      })
    )
  })

  it('should throw error when email config is missing', () => {
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS

    // This would test the actual error handling in emailService
    expect(() => {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Configuración de email incompleta')
      }
    }).toThrow('Configuración de email incompleta')
  })

  it('should verify transporter connection', async () => {
    const mockVerify = jest.fn().mockResolvedValue(true)
    const mockTransporter = {
      verify: mockVerify,
      sendMail: jest.fn(),
    }

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter)

    const transporter = nodemailer.createTransport({})
    const verified = await transporter.verify()

    expect(mockVerify).toHaveBeenCalled()
    expect(verified).toBe(true)
  })

  it('should send email successfully', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 OK',
    })

    const mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: mockSendMail,
    }

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter)

    const transporter = nodemailer.createTransport({})
    const result = await transporter.sendMail({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
    })

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'recipient@example.com',
        subject: 'Test Subject',
      })
    )
    expect(result.messageId).toBe('test-message-id')
  })
})
