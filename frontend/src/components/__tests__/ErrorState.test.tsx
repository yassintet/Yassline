import { render, screen } from '@testing-library/react'
import ErrorState from '../ErrorState'

describe('ErrorState', () => {
  it('should render with default title and message', () => {
    render(<ErrorState message="Error message" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    render(<ErrorState title="Custom Error" message="Error message" />)
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
  })

  it('should show back button when showBackButton is true', () => {
    render(<ErrorState message="Error" showBackButton={true} />)
    expect(screen.getByText('Volver')).toBeInTheDocument()
  })

  it('should not show back button when showBackButton is false', () => {
    render(<ErrorState message="Error" showBackButton={false} />)
    expect(screen.queryByText('Volver')).not.toBeInTheDocument()
  })

  it('should use custom back label', () => {
    render(
      <ErrorState
        message="Error"
        showBackButton={true}
        backLabel="Go Back"
      />
    )
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('should link to custom back URL', () => {
    render(
      <ErrorState
        message="Error"
        showBackButton={true}
        backUrl="/custom"
      />
    )
    const link = screen.getByText('Volver').closest('a')
    expect(link).toHaveAttribute('href', '/custom')
  })
})
