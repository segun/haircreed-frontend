import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import db from '../../instant';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const DiscountVsFullPriceChart: React.FC = () => {
  const { isLoading, error, data } = db.useQuery({ Orders: {} });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const chartData = useMemo(() => {
    if (!data?.Orders) return [];

    const salesByDate = data.Orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, discounted: 0, fullPrice: 0 };
      }

      if (order.discountAmount && order.discountAmount > 0) {
        acc[date].discounted += order.totalAmount;
      } else {
        acc[date].fullPrice += order.totalAmount;
      }

      return acc;
    }, {} as { [key: string]: { date: string; discounted: number; fullPrice: number } });

    return Object.values(salesByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [data]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Discount vs. Full Price Sales</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    angle={isMobile ? -45 : 0} 
                    textAnchor={isMobile ? 'end' : 'middle'} 
                    height={isMobile ? 80 : 30} 
                    fontSize={isMobile ? 10 : 12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fullPrice" stackId="a" fill="#8884d8" name="Full Price" />
                <Bar dataKey="discounted" stackId="a" fill="#82ca9d" name="Discounted" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default DiscountVsFullPriceChart;
