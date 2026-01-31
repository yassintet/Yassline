import { render, screen } from '@testing-library/react'
import LoadingState from '../LoadingState'

describe('LoadingState', () => {
  it('should render with default message', () => {
    render(<LoadingState />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingState message="Cargando datos..." />)
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('should render loader icon', () => {
    const { container } = render(<LoadingState />)
    const loader = container.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('should apply fullScreen class when fullScreen is true', () => {
    const { container } = render(<LoadingState fullScreen={true} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('min-h-[calc(100vh-200px)]')
  })

  it('should not apply fullScreen class when fullScreen is false', () => {
    const { container } = render(<LoadingState fullScreen={false} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('py-20')
  })
})
