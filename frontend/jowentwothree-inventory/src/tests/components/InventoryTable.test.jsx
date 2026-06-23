import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InventoryTable from '../../components/InventoryTable/InventoryTable';

const mockData = [
  { id: 1, itemId: 'ITM-001', name: 'Whole Milk', category: 'Dairy', inStock: 45, status: 'Good' },
  { id: 2, itemId: 'ITM-002', name: 'Vanilla Syrup', category: 'Syrups', inStock: 8, status: 'Low Stock' },
];

describe('InventoryTable Component', () => {
  it('renders table with correct headers', () => {
    render(<InventoryTable data={mockData} searchTerm="" />);
    expect(screen.getByText('ITEM ID')).toBeInTheDocument();
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText('CATEGORY')).toBeInTheDocument();
    expect(screen.getByText('IN STOCK')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
  });

  it('displays all inventory items', () => {
    render(<InventoryTable data={mockData} searchTerm="" />);
    expect(screen.getByText('Whole Milk')).toBeInTheDocument();
    expect(screen.getByText('Vanilla Syrup')).toBeInTheDocument();
  });

  it('filters items based on search term', () => {
    render(<InventoryTable data={mockData} searchTerm="Milk" />);
    expect(screen.getByText('Whole Milk')).toBeInTheDocument();
    expect(screen.queryByText('Vanilla Syrup')).not.toBeInTheDocument();
  });

  it('shows empty state when no items match search', () => {
    render(<InventoryTable data={mockData} searchTerm="Nonexistent" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<InventoryTable data={mockData} searchTerm="" />);
    const badges = screen.getAllByText(/Good|Low Stock/);
    expect(badges).toHaveLength(2);
    expect(screen.getByText('Good')).toHaveClass('status-good');
    expect(screen.getByText('Low Stock')).toHaveClass('status-low');
  });
});