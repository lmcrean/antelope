import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JwtButton } from './JwtButton';

describe('JwtButton', () => {
  it('should render initial state correctly', () => {
    render(<JwtButton />);
    
    expect(screen.getByText('JWT TEST')).toBeInTheDocument();
    expect(screen.getByText('currently signed out')).toBeInTheDocument();
  });

  it('should show success states when clicked', async () => {
    render(<JwtButton />);
    
    const button = screen.getByText('JWT TEST');
    fireEvent.click(button);

    // Container should turn green
    const container = button.closest('div');
    expect(container).toHaveClass('bg-green-100');

    // Check all success messages are displayed
    expect(screen.getByText(/✅signed up as Random_3425/)).toBeInTheDocument();
    expect(screen.getByText(/✅signed in as Random_3425/)).toBeInTheDocument();
    expect(screen.getByText(/✅JWT Token created/)).toBeInTheDocument();
    expect(screen.getByText(/✅auth Token is currently being used/)).toBeInTheDocument();
    expect(screen.getByText(/✅refresh token is currently being used/)).toBeInTheDocument();
  });
}); 