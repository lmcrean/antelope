import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import React from 'react'
import { GetApiMessageButton } from '../GetApiMessageButton'

vi.mock('axios')

describe('GetApiMessageButton Before Request', () => {
  it('renders correctly in initial state', () => {
    render(<GetApiMessageButton />)
    
    // Check button exists with correct text
    const button = screen.getByTestId('api-message-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Get API Message')
    expect(button).not.toBeDisabled()
    
    // Check container has initial color
    const container = screen.getByTestId('api-message-container')
    expect(container).toHaveClass('bg-gray-900/20')
    
    // Check status and error messages are not present
    expect(screen.queryByTestId('api-message-status')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  it('accepts and applies custom className', () => {
    const customClass = 'custom-test-class'
    render(<GetApiMessageButton className={customClass} />)
    
    const container = screen.getByTestId('api-message-container')
    expect(container).toHaveClass(customClass)
  })

  it('has correct button styling in initial state', () => {
    render(<GetApiMessageButton />)
    
    const button = screen.getByTestId('api-message-button')
    expect(button).toHaveClass('bg-blue-500', 'text-white', 'font-bold', 'rounded')
  })
}) 