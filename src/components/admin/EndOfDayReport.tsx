import React, { useState, useMemo } from 'react';
import db from '../../instant';

const EndOfDayReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const startDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, [selectedDate]);

  const endDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }, [selectedDate]);

  const { isLoading, error, data } = db.useQuery({
    Orders: {
      $: {
        where: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    },
  });

  const reportData = useMemo(() => {
    const orders = data?.Orders || [];

    if (!orders.length) {
      return null;
    }

    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalVat = orders.reduce((acc, order) => acc + order.vatAmount, 0);
    const totalDiscounts = orders.reduce((acc, order) => acc + order.discountAmount, 0);
    const numberOfOrders = orders.length;

    const salesByPaymentMethod = orders.reduce((acc, order) => {
      // This assumes that the payment status can be used to determine the payment method.
      // You might need to adjust this based on your actual data.
      const paymentMethod = order.paymentStatus; // e.g., 'PAID', 'PENDING'
      acc[paymentMethod] = (acc[paymentMethod] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      totalVat,
      totalDiscounts,
      numberOfOrders,
      salesByPaymentMethod,
    };
  }, [data?.Orders]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">End-of-Day (Z) Report</h2>
      <div className="mb-4">
        <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <input
          type="date"
          id="selectedDate"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {reportData && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Sales Summary for {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reportData.totalSales.toFixed(2)}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total VAT Collected</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reportData.totalVat.toFixed(2)}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Discounts Given</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reportData.totalDiscounts.toFixed(2)}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Number of Orders</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{reportData.numberOfOrders}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Sales per Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul>
                    {Object.entries(reportData.salesByPaymentMethod).map(([method, total]) => (
                      <li key={method}>
                        {method}: {total.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndOfDayReport;
