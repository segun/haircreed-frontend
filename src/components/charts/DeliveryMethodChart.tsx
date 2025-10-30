import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DeliveryMethodChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Orders: {} });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const chartData = useMemo(() => {
    if (!data?.Orders) return [];

    const methodCounts = data.Orders.reduce((acc, order) => {
      const method = order.deliveryMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method]++;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(methodCounts).map(method => ({
      name: method,
      value: methodCounts[method],
    }));

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Delivery Method Popularity</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? false : (entry) => `${entry.name}: ${(((entry.value as number) / data.Orders.length) * 100).toFixed(0)}%`}
                >
                    {chartData.map((_, index) => (
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

export default DeliveryMethodChart;
