
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';

const COLORS = ['#0088FE', '#FFBB28'];

const PaymentStatusBreakdownChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Orders: {} });

  const chartData = useMemo(() => {
    if (!data?.Orders) return [];

    const statusCounts = data.Orders.reduce((acc, order) => {
      const status = order.paymentStatus || 'PENDING'; // Default to PENDING if status is not set
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
    }));

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Payment Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default PaymentStatusBreakdownChart;
