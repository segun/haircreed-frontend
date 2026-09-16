import React, { useMemo } from 'react';
import { getOrderFulfillment } from '../../api/databaseReads';
import { useApiQuery } from '../../hooks/useApiQuery';

const INCLUDED_STATUSES = ['CREATED', 'IN PROGRESS', 'COMPLETED', 'DISPATCHED', 'RETURNED'];

const OrderFulfillmentReport: React.FC = () => {
  const { isLoading, error, data } = useApiQuery(
    'reports-order-fulfillment',
    (signal) => getOrderFulfillment(INCLUDED_STATUSES, signal),
  );

  const orders = useMemo(() => data || [], [data]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order Fulfillment Report</h2>

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
                Order Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Delivery Method
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Update
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.orderStatus}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.deliveryMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderFulfillmentReport;
