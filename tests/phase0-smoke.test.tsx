import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('Phase 0 Smoke Test', () => {
  it('renders Mayflower website interface', () => {
    render(<App />);
    const elements = screen.getAllByText(/MAYFLOWER/i);
    expect(elements.length).toBeGreaterThan(0);

    const subTitles = screen.getAllByText(/CAFE & DINING/i);
    expect(subTitles.length).toBeGreaterThan(0);
  });
});
