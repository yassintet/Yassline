import { render, screen } from '@testing-library/react'
import Navbar from '../Navbar'
import { authUtils } from '@/lib/auth'

// Mock authUtils
jest.mock('@/lib/auth', () => ({
  authUtils: {
    isAuthenticated: jest.fn(),
    isAdmin: jest.fn(),
    logout: jest.fn(),
  },
}))

// Mock useI18n
jest.mock('@/lib/i18n/context', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.home': 'Inicio',
        'nav.transport': 'Transporte',
        'nav.circuits': 'Circuitos',
        'nav.vehicles': 'Vehículos',
        'nav.contact': 'Contacto',
        'nav.admin': 'Admin',
        'nav.login': 'Iniciar sesión',
        'nav.logout': 'Cerrar sesión',
      }
      return translations[key] || key
    },
  }),
}))

// Mock LanguageCurrencySelector
jest.mock('../LanguageCurrencySelector', () => {
  return function MockLanguageCurrencySelector() {
    return <div data-testid="language-selector">Language Selector</div>
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(authUtils.isAuthenticated as jest.Mock).mockReturnValue(false)
    ;(authUtils.isAdmin as jest.Mock).mockReturnValue(false)
  })

  it('should render logo', () => {
    render(<Navbar />)
    expect(screen.getByText('Yassline Tour')).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('Circuitos')).toBeInTheDocument()
    expect(screen.getByText('Vehículos')).toBeInTheDocument()
    expect(screen.getByText('Contacto')).toBeInTheDocument()
  })

  it('should show login button when not authenticated', () => {
    render(<Navbar />)
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })

  it('should show logout button when authenticated', () => {
    ;(authUtils.isAuthenticated as jest.Mock).mockReturnValue(true)
    render(<Navbar />)
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
  })

  it('should show admin link when user is admin', () => {
    ;(authUtils.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authUtils.isAdmin as jest.Mock).mockReturnValue(true)
    render(<Navbar />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should not show admin link when user is not admin', () => {
    ;(authUtils.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authUtils.isAdmin as jest.Mock).mockReturnValue(false)
    render(<Navbar />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('should render language selector', () => {
    render(<Navbar />)
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })
})
