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
    expect(button).toBeEnabled()
    expect(button).toHaveTextContent('Check API Health')
  })

  it('renders with correct initial structure', () => {
    const container = screen.getByTestId('api-health-container')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(1) // Only button, no status or error
    expect(container.firstChild).toBe(screen.getByTestId('api-health-button'))
  })

  it('has no initial status or error elements', () => {
    expect(screen.queryByTestId('api-health-status')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })
}) 