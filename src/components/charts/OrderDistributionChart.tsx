
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';

const OrderDistributionChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Customers: { orders: {} } });

  const chartData = useMemo(() => {
    if (!data?.Customers) return [];

    const orderCounts = data.Customers.map(c => c.orders.length);

    const buckets = {
      '1': 0,
      '2-3': 0,
      '4-5': 0,
      '6-10': 0,
      '10+': 0,
    };

    orderCounts.forEach(count => {
      if (count === 1) buckets['1']++;
      else if (count >= 2 && count <= 3) buckets['2-3']++;
      else if (count >= 4 && count <= 5) buckets['4-5']++;
      else if (count >= 6 && count <= 10) buckets['6-10']++;
      else if (count > 10) buckets['10+']++;
    });

    return Object.keys(buckets).map(key => ({
      name: key,
      customers: buckets[key as keyof typeof buckets],
    }));

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Order Distribution by Customer</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#8884d8" name="Number of Customers" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default OrderDistributionChart;
