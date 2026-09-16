import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type DiscountVsFullPriceChartProps = {
  data: DashboardResponse['charts']['discountVsFullPrice'];
};

const DiscountVsFullPriceChart: React.FC<DiscountVsFullPriceChartProps> = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.bucketStart).toLocaleDateString(),
      discounted: item.discounted,
      fullPrice: item.fullPrice,
    }));
  }, [data]);

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
