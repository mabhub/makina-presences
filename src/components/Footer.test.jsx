/**
 * Tests for Footer component
 * This is a simple stateless component that displays a GitHub link
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Footer from './Footer';
import { renderWithProviders } from '../testUtils';

describe('Footer', () => {
  it('should render without crashing', () => {
    renderWithProviders(<Footer />);

    // Should find a link to GitHub
    const githubLink = screen.getByRole('link');
    expect(githubLink).toBeInTheDocument();
  });

  it('should contain a link to the GitHub repository', () => {
    renderWithProviders(<Footer />);

    const githubLink = screen.getByRole('link');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/mabhub/makina-presences');
  });

  it('should display GitHub icon', () => {
    renderWithProviders(<Footer />);

    // Material-UI GitHub icon should be rendered
    const githubIcon = screen.getByTestId('GitHubIcon') || screen.getByTitle('GitHub');
    expect(githubIcon).toBeInTheDocument();
  });

  it('should have proper container styling', () => {
    const { container } = renderWithProviders(<Footer />);

    // Should have a Container with proper styling
    const containerElement = container.querySelector('.MuiContainer-root');
    expect(containerElement).toBeInTheDocument();
  });

  it('should center the content', () => {
    const { container } = renderWithProviders(<Footer />);

    // Should have a Grid container with justifyContent center
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should be wrapped in React.memo', () => {
    // Footer should be a memoized component
    expect(Footer.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
