import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../../components/Dashboard/Dashboard';

describe('Dashboard Component', () => {
  it('renders dashboard header with correct title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
  });

  it('displays add product button', () => {
    render(<Dashboard />);
    expect(screen.getByText('+ Add Product')).toBeInTheDocument();
  });

  it('renders dashboard statistics cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Total Units')).toBeInTheDocument();
  });
});