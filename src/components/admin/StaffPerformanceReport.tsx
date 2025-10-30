
import React, { useMemo } from 'react';
import db from '../../instant';

const StaffPerformanceReport: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({
    Users: {
      createdOrders: {},
    },
  });

  const users = useMemo(() => data?.Users || [], [data]);

  const performanceData = useMemo(() => {
    console.log('Users data:', users);
    console.log("User Orders data:", users.map(user => user.createdOrders));

    return users.map((user) => {
      const totalOrders = user.createdOrders.length;
      const totalSales = user.createdOrders.reduce(
        (acc, order) => acc + (order.totalAmount || 0),
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      return {
        id: user.id,
        fullName: user.fullName,
        totalOrders,
        totalSales,
        averageOrderValue,
      };
    });
  }, [users]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Staff Performance Report</h2>

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
                User Full Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Orders Processed
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Sales Value
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Average Order Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`$${user.totalSales.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`$${user.averageOrderValue.toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformanceReport;
