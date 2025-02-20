/// <reference types="vitest" />
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { APIHealthButton } from '../GetSupaBaseHealthButton'

describe('GetSupabaseHealth Before Request', () => {
  beforeEach(() => {
    render(<APIHealthButton />)
  })

  it('renders with correct initial button state', () => {
    const button = screen.getByTestId('api-health-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Check API Health')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-red-500')
  })

  it('renders with correct initial container state', () => {
    const container = screen.getByTestId('api-health-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bg-red-900/20')
  })

  it('does not show status or error initially', () => {
    expect(screen.queryByTestId('api-health-status')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })
}) 