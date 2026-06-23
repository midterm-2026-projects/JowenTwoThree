import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from '../../components/Sidebar/Sidebar';

describe('Sidebar Component', () => {
  it('renders all navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays company logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('JowenTwoThree')).toBeInTheDocument();
  });

  it('shows user info in footer', () => {
    render(<Sidebar />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<Sidebar />);
    const inventoryLink = screen.getByText('Inventory');
    expect(inventoryLink.closest('button')).toHaveClass('active');
  });
});