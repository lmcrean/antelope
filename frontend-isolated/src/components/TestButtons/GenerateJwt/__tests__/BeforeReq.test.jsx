import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GenerateJWTButton } from '../GenerateJWTButton'

describe('GenerateJWTButton - Before Request', () => {
  it('should render with correct initial text', () => {
    render(<GenerateJWTButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Generate JWT')
  })

  it('should have the correct initial styling', () => {
    render(<GenerateJWTButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('should render in an enabled state', () => {
    render(<GenerateJWTButton />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should not show any status or error messages initially', () => {
    render(<GenerateJWTButton />)
    const container = screen.getByTestId('jwt-container')
    expect(container).not.toHaveTextContent('Token:')
    expect(container).not.toHaveTextContent('Error:')
  })

  it('should accept and apply custom className prop', () => {
    const customClass = 'test-custom-class'
    render(<GenerateJWTButton className={customClass} />)
    const container = screen.getByTestId('jwt-container')
    expect(container).toHaveClass(customClass)
  })
}) 