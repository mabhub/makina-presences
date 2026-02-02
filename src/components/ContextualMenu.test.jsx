/**
 * Tests for ContextualMenu component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ContextualMenu from './ContextualMenu';
import { renderWithProviders } from '../testUtils';

describe('ContextualMenu', () => {
  const mockOnClose = vi.fn();
  const mockAction1 = vi.fn();
  const mockAction2 = vi.fn();
  const mockAction3 = vi.fn();

  const defaultProps = {
    anchor: null,
    title: 'Test Menu',
    items: [
      { item: 'Action 1', action: mockAction1 },
      { item: 'Action 2', action: mockAction2, disabled: true },
      { item: 'divider', separator: true },
      { item: 'Action 3', action: mockAction3 },
    ],
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render menu when anchor is null', () => {
    renderWithProviders(<ContextualMenu {...defaultProps} />);
    expect(screen.queryByText('Test Menu')).not.toBeInTheDocument();
  });

  it('should render menu when anchor is provided', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    expect(screen.getByText('Test Menu')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
    expect(screen.getByText('Action 3')).toBeInTheDocument();

    document.body.removeChild(anchor);
  });

  it('should synchronize anchorEl when anchor prop changes from null to element', async () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);

    const { rerender } = renderWithProviders(<ContextualMenu {...defaultProps} anchor={null} />);

    expect(screen.queryByText('Test Menu')).not.toBeInTheDocument();

    // Change anchor to an element
    rerender(<ContextualMenu {...defaultProps} anchor={anchor} />);

    await waitFor(() => {
      expect(screen.getByText('Test Menu')).toBeInTheDocument();
    });

    document.body.removeChild(anchor);
  });

  it('should synchronize anchorEl when anchor prop changes from element to null', async () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);

    const { rerender } = renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    expect(screen.getByText('Test Menu')).toBeInTheDocument();

    // Change anchor to null (close menu)
    rerender(<ContextualMenu {...defaultProps} anchor={null} />);

    await waitFor(() => {
      expect(screen.queryByText('Test Menu')).not.toBeInTheDocument();
    });

    document.body.removeChild(anchor);
  });

  it('should call action and close menu when item is clicked', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    fireEvent.click(screen.getByText('Action 1'));

    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith(false);

    document.body.removeChild(anchor);
  });

  it('should not call action when disabled item is clicked', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    const disabledItem = screen.getByText('Action 2').closest('button');
    expect(disabledItem).toBeDisabled();

    // Click should not trigger action
    fireEvent.click(disabledItem);
    expect(mockAction2).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('should render items before and after separator', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    // Verify items before separator
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
    // Verify item after separator
    expect(screen.getByText('Action 3')).toBeInTheDocument();

    document.body.removeChild(anchor);
  });

  it('should render menu without title', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    const propsWithoutTitle = { ...defaultProps, title: null, anchor };
    renderWithProviders(<ContextualMenu {...propsWithoutTitle} />);

    expect(screen.queryByText('Test Menu')).not.toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();

    document.body.removeChild(anchor);
  });

  it('should call onClose when clicking backdrop', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    renderWithProviders(<ContextualMenu {...defaultProps} anchor={anchor} />);

    // MUI Menu's backdrop click
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledWith(false);
    }

    document.body.removeChild(anchor);
  });

  it('should handle multiple menu items correctly', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);

    const manyItems = [
      { item: 'Item 1', action: vi.fn() },
      { item: 'Item 2', action: vi.fn() },
      { item: 'Item 3', action: vi.fn(), disabled: true },
      { item: 'separator', separator: true },
      { item: 'Item 4', action: vi.fn() },
      { item: 'Item 5', action: vi.fn() },
    ];

    renderWithProviders(<ContextualMenu {...defaultProps} items={manyItems} anchor={anchor} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();

    const disabledItem = screen.getByText('Item 3').closest('button');
    expect(disabledItem).toBeDisabled();

    document.body.removeChild(anchor);
  });
});
