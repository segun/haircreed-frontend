
import React, { useMemo } from 'react';
import db from '../../instant';

const InventoryValuationReport: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({
    InventoryItems: {
      attributes: {},
    },
  });

  const items = useMemo(() => data?.InventoryItems || [], [data?.InventoryItems]);

  const formatAttributes = (attributes: { name: string }[]) => {
    if (!attributes || attributes.length === 0) return 'N/A';
    return attributes.map((attr) => attr.name).join(', ');
  };

  const totalValue = useMemo(() => {
    return items.reduce((acc, item) => {
      const itemValue = (item.quantity || 0) * (item.costPrice || 0);
      return acc + itemValue;
    }, 0);
  }, [items]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory Valuation Report</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <div className="overflow-auto max-h-[calc(100vh-300px)] border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Item Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity on Hand
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cost Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatAttributes(item.attributes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.costPrice ? `$${item.costPrice.toFixed(2)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`$${((item.quantity || 0) * (item.costPrice || 0)).toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right font-bold text-lg mt-4">
        Total Inventory Value: {`$${totalValue.toFixed(2)}`}
      </div>
    </div>
  );
};

export default InventoryValuationReport;
