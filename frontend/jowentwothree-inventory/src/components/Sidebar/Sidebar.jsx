import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('inventory');

  const navItems = [
    { id: 'inventory', label: 'Inventory'},
    { id: 'orders', label: 'Orders'},
    { id: 'reports', label: 'Reports'},
    { id: 'settings', label: 'Settings'},
  ];

  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <h1 className="logo">JowenTwoThree</h1>
        <p className="subtitle">Inventory Management</p>
      </div>
      
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => setActiveItem(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {' Admin User'}
      </div>
    </nav>
  );
};

export default Sidebar;