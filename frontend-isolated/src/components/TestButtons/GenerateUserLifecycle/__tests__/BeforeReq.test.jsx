import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UserLifecycleButton } from '../UserLifecycleButton'

const mockToken = 'mock-jwt-token'

describe('UserLifecycleButton - Before Request', () => {
  it('should render with correct initial text', () => {
    render(<UserLifecycleButton token={mockToken} />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Test User Lifecycle')
  })

  it('should have the correct initial styling', () => {
    render(<UserLifecycleButton token={mockToken} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('should render in an enabled state', () => {
    render(<UserLifecycleButton token={mockToken} />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should not show any lifecycle data or error messages initially', () => {
    render(<UserLifecycleButton token={mockToken} />)
    const container = screen.getByTestId('user-lifecycle-container')
    expect(container).not.toHaveTextContent('Lifecycle Test Results:')
    expect(container).not.toHaveTextContent('Test Username:')
    expect(container).not.toHaveTextContent('Error:')
  })

  it('should accept and apply custom className prop', () => {
    const customClass = 'test-custom-class'
    render(<UserLifecycleButton token={mockToken} className={customClass} />)
    const container = screen.getByTestId('user-lifecycle-container')
    expect(container).toHaveClass(customClass)
  })

  it('should have accessible button role', () => {
    render(<UserLifecycleButton token={mockToken} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render without token prop', () => {
    render(<UserLifecycleButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
}) 