
import React from 'react';
import db from '../../instant';

const OutstandingPaymentsReport: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({
    Orders: {
      $: {
        where: {
          paymentStatus: { $ne: 'PAID' },
        },
      },
      customer: {},
    },
  });

  const orders = data?.Orders || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Outstanding Payments Report</h2>

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
                Order Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer Email/Phone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount Paid
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.customer?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.customer?.email || order.customer?.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* NOTE: Schema does not have amountPaid, assuming 0 for non-Paid orders */}
                  0
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingPaymentsReport;
