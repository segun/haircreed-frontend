import React, { useMemo } from 'react';
import db from '../../instant';

const WiggerReport: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({
    Wigger: {
      orders: {},
    },
  });

  const wiggerStats = useMemo(() => {
    if (!data?.Wigger) return [];
    
    return data.Wigger.map((wigger) => ({
      name: wigger.name,
      orderCount: wigger.orders?.length || 0,
      wigger,
    })).sort((a, b) => b.orderCount - a.orderCount);
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Wigger Report</h2>
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Wigger Report</h2>
        <p className="text-sm text-red-500 bg-red-100 p-2 rounded-md">
          Error loading wigger data: {error.message}
        </p>
      </div>
    );
  }

  const totalOrders = wiggerStats.reduce((sum, w) => sum + w.orderCount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wigger Report</h2>
      
      <div className="mb-6">
        <p className="text-zinc-600">
          Total Wiggers: <span className="font-semibold">{wiggerStats.length}</span>
        </p>
        <p className="text-zinc-600">
          Total Orders: <span className="font-semibold">{totalOrders}</span>
        </p>
      </div>

      {wiggerStats.length === 0 ? (
        <p className="text-zinc-500 italic">No wiggers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Wigger Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Number of Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {wiggerStats.map((wigger) => (
                <tr key={wigger.wigger.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {wigger.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                    {wigger.orderCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                    {totalOrders > 0 
                      ? ((wigger.orderCount / totalOrders) * 100).toFixed(1) 
                      : '0.0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WiggerReport;
