import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('should render footer with company name', () => {
    render(<Footer />)
    expect(screen.getByText('Yassline Tour')).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Footer />)
    
    expect(screen.getByText('Sobre nosotros')).toBeInTheDocument()
    expect(screen.getByText('Nuestra flota')).toBeInTheDocument()
    expect(screen.getByText('Contacto')).toBeInTheDocument()
    expect(screen.getByText('Circuitos')).toBeInTheDocument()
    expect(screen.getByText('Traslados')).toBeInTheDocument()
    expect(screen.getByText('Vehículos')).toBeInTheDocument()
  })

  it('should render contact information', () => {
    render(<Footer />)
    
    expect(screen.getByText('+212 669 215 611')).toBeInTheDocument()
    expect(screen.getByText('info@yassline.com')).toBeInTheDocument()
  })

  it('should render legal links', () => {
    render(<Footer />)
    
    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument()
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument()
  })

  it('should render copyright notice', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} Yassline Tour. Todos los derechos reservados.`)).toBeInTheDocument()
  })
})
