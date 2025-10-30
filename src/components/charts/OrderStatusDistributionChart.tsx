
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';

const STAGES = ['CREATED', 'PENDING', 'COMPLETED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

const OrderStatusDistributionChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Orders: {} });

  const chartData = useMemo(() => {
    if (!data?.Orders) return [];

    const statusCounts = data.Orders.reduce((acc, order) => {
      const status = order.orderStatus || 'CREATED'; // Default to CREATED
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {} as { [key: string]: number });

    return STAGES.map(stage => ({
        name: stage,
        orders: statusCounts[stage] || 0,
    }));

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Number of Orders" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default OrderStatusDistributionChart;
