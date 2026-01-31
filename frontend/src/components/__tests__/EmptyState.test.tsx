import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState', () => {
  it('should render with default icon and message', () => {
    render(<EmptyState message="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    render(<EmptyState title="Custom Title" message="Message" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should show action link when showAction is true', () => {
    render(
      <EmptyState
        message="No items"
        showAction={true}
        actionLabel="Add Item"
        actionUrl="/add"
      />
    )
    expect(screen.getByText('Add Item')).toBeInTheDocument()
    const link = screen.getByText('Add Item').closest('a')
    expect(link).toHaveAttribute('href', '/add')
  })

  it('should render custom children', () => {
    render(
      <EmptyState message="No items">
        <button>Custom Button</button>
      </EmptyState>
    )
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })

  it('should not show action when children are provided', () => {
    render(
      <EmptyState
        message="No items"
        showAction={true}
        actionLabel="Add Item"
        actionUrl="/add"
      >
        <button>Custom Button</button>
      </EmptyState>
    )
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument()
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })
})
