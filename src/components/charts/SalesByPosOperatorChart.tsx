
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';

const SalesByPosOperatorChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Users: { createdOrders: {} } });

  const chartData = useMemo(() => {
    if (!data?.Users) return [];

    return data.Users.map(user => ({
      name: user.fullName,
      sales: user.createdOrders.reduce((acc, order) => acc + order.totalAmount, 0),
    }));

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sales by POS Operator</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" name="Total Sales" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesByPosOperatorChart;
