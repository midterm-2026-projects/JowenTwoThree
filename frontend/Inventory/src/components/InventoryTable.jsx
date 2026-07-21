// src/components/InventoryTable.jsx
import React, { useEffect, useMemo, useState } from 'react';
import StockStatusBadge from './StockStatusBadge';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import InventoryAdjustmentForm from './InventoryAdjustmentForm';
import { fetchInventory, updateInventory } from '../services/inventoryApi';

const calculateStatus = (inStock) => {
  if (inStock === 0) return 'OutOfStock';
  if (inStock <= 5) return 'Low';
  if (inStock <= 10) return 'NearingExpiration';
  return 'Good';
};

export default function InventoryTable() {
  const [inventoryData, setInventoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAdjustmentFormOpen, setIsAdjustmentFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  const loadInventory = async () => {
    console.log("========== LOAD INVENTORY ==========");
    console.log("Loading inventory...");

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchInventory();

      console.log("Raw data returned from fetchInventory():", data);
      console.log("Is Array:", Array.isArray(data));
      console.log("Number of items:", Array.isArray(data) ? data.length : 0);

      if (Array.isArray(data) && data.length > 0) {
        console.table(data);
      }

      const itemsWithStatus = (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        status: calculateStatus(item.inStock),
      }));

      console.log("Items after status mapping:");
      console.table(itemsWithStatus);

      setInventoryData(itemsWithStatus);

    } catch (err) {
      console.error("Error loading inventory:", err);

      setErrorMessage("Failed to load inventory. Please try again.");
      setInventoryData([]);
    } finally {
      setIsLoading(false);
      console.log("========== END LOAD INVENTORY ==========");
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(inventoryData.map((item) => item.category))];
  }, [inventoryData]);

  const filteredData = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [inventoryData, searchTerm, selectedCategory]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsAdjustmentFormOpen(true);
  };

  const handleAdjustmentSubmit = async (adjustmentData) => {
    try {
      await updateInventory(adjustmentData.itemId, {
        quantity: adjustmentData.quantity,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
      });

      setToast({
        type: 'success',
        message: `✅ Successfully adjusted ${adjustmentData.itemName}!`,
      });

      await loadInventory();

      setTimeout(() => setToast(null), 3000);

    } catch (err) {
      setToast({
        type: 'error',
        message: `❌ Failed to update inventory: ${err.message}`,
      });

      setTimeout(() => setToast(null), 3000);
      throw err;
    }
  };

  const handleModalClose = () => {
    setIsAdjustmentFormOpen(false);
    setSelectedItem(null);
  };

  const clearToast = () => setToast(null);

  return (
    <div className="inventory-container">

      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          data-testid="toast-message"
          onClick={clearToast}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: toast.type === 'success' ? '#4CAF50' : '#f44336',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="controls-section">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterDropdown
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading inventory...
          </div>
        ) : errorMessage ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            {errorMessage}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ITEM ID</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>IN STOCK</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.inStock}</td>

                    <td>
                      <StockStatusBadge
                        status={item.status}
                        inStock={item.inStock}
                      />
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <InventoryAdjustmentForm
        isOpen={isAdjustmentFormOpen}
        onClose={handleModalClose}
        item={selectedItem}
        onSubmit={handleAdjustmentSubmit}
      />
    </div>
  );
}