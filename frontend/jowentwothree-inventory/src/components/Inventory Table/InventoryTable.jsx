import './InventoryTable.css';

const InventoryTable = ({ data, searchTerm }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      'Good': 'status-good',
      'Low Stock': 'status-low',
      'Critical': 'status-critical',
    };
    return `status-badge ${statusMap[status] || 'status-good'}`;
  };

  const term = (searchTerm || '').toLowerCase();
  const filteredData = data.filter((item) => {
    return (
      item.name.toLowerCase().includes(term) ||
      item.itemId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ITEM ID</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>IN STOCK</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="table-row">
                <td className="item-id">{item.itemId}</td>
                <td className="item-name">{item.name}</td>
                <td className="item-category">{item.category}</td>
                <td className="item-stock">{item.inStock}</td>
                <td>
                  <span className={getStatusBadge(item.status)}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="empty-state">
            <p>No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;