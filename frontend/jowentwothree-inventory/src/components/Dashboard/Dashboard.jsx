import { useState } from 'react';
import InventoryTable from '../InventoryTable/InventoryTable';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm] = useState('');

  // Sample data - will be replaced with actual data from API
  const inventoryData = [
    { id: 1, itemId: 'ITM-001', name: 'Whole Milk', category: 'Dairy', inStock: 45, status: 'Good' },
    { id: 2, itemId: 'ITM-002', name: 'Vanilla Syrup', category: 'Syrups', inStock: 8, status: 'Low Stock' },
    { id: 3, itemId: 'ITM-003', name: 'Espresso Beans', category: 'Coffee', inStock: 120, status: 'Good' },
    { id: 4, itemId: 'ITM-004', name: 'Caramel Sauce', category: 'Syrups', inStock: 5, status: 'Critical' },
    { id: 5, itemId: 'ITM-005', name: 'Oat Milk', category: 'Dairy', inStock: 32, status: 'Good' },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Inventory Dashboard</h2>
        <div className="header-actions">
          <button className="btn-primary">+ Add Product</button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{inventoryData.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Inventory</span>
          <span className="stat-value warning" aria-label="Low Stock Count">
            {inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Units</span>
          <span className="stat-value">
            {inventoryData.reduce((sum, item) => sum + item.inStock, 0)}
          </span>
        </div>
      </div>

      <InventoryTable data={inventoryData} searchTerm={searchTerm} />
    </div>
  );
};

export default Dashboard;