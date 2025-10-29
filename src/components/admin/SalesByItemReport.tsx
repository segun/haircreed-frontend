import React, { useState, useMemo } from 'react';
import db from '../../instant';

const SalesByItemReport: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Default to last 7 days - memoized to prevent infinite re-renders
  const defaultStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.getTime();
  }, []);

  const defaultEndDate = useMemo(() => {
    return new Date().getTime();
  }, []);

  const { isLoading, error, data } = db.useQuery({
    Orders: {
      $: {
        where: {
          createdAt: {
            $gte: startDate ? new Date(startDate).getTime() : defaultStartDate,
            $lte: endDate ? new Date(endDate).getTime() : defaultEndDate,
          },
        },
      },
    },
  });

  const salesByItem = useMemo(() => {
    const orders = data?.Orders || [];
    if (!orders.length) {
      return {};
    }

    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach(order => {
      (order.items as Array<{ id: string; name: string; quantity: number; price: number }>).forEach(item => {
        if (itemSales[item.id]) {
          itemSales[item.id].quantity += item.quantity;
          itemSales[item.id].revenue += item.price * item.quantity;
        } else {
          itemSales[item.id] = {
        name: item.name,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
          };
        }
      });
    });

    return itemSales;
  }, [data?.Orders]);

  const sortedSales = useMemo(() => {
    return Object.entries(salesByItem).sort(([, a], [, b]) => b.quantity - a.quantity);
  }, [salesByItem]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sales by Item Report</h2>
      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedSales.map(([id, itemData]) => (
            <tr key={id}>
              <td className="px-6 py-4 whitespace-nowrap">{itemData.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{itemData.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">{itemData.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesByItemReport;
