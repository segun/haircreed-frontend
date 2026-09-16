import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type DeliveryMethodChartProps = {
  data: DashboardResponse['charts']['deliveryMethod'];
};

const DeliveryMethodChart: React.FC<DeliveryMethodChartProps> = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Delivery Method Popularity</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? false : (entry) => `${entry.name}: ${Number(entry.percentage).toFixed(0)}%`}
                >
                    {data.map((_, index) => (
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
