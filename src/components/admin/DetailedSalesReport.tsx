import React, { useState, useMemo } from "react";
import db from "../../instant";

const DetailedSalesReport: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
      customer: {},
      posOperator: {},
    },
  });

  const orders = useMemo(() => (data?.Orders || []).slice().sort((a, b) => b.createdAt - a.createdAt), [data?.Orders]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Detailed Sales Report</h2>
      <div className="flex space-x-4 mb-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
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
              Date
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
              POS Operator
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Items Sold
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Subtotal
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              VAT
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Discount Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Delivery Charge
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-.medium text-gray-500 uppercase tracking-wider"
            >
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.orderNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.customer?.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.posOperator?.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ul>
                  {(order.items as { id: string; name: string; quantity: number }[]).map((item) => (
                    <li key={item.id}>
                      {item.name} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{order.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.vatAmount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.discountAmount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.deliveryCharge}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.totalAmount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.paymentStatus}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailedSalesReport;
