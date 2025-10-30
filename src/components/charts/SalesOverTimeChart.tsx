
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';

const SalesOverTimeChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Orders: {} });

  const chartData = useMemo(() => {
    if (!data?.Orders) return [];

    const salesByDate = data.Orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.totalAmount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(salesByDate).map(date => ({
      date,
      sales: salesByDate[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesOverTimeChart;
