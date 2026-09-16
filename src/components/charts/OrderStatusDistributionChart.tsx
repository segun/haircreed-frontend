import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const STAGES = ['CREATED', 'IN PROGRESS', 'COMPLETED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#8884d8'];

type OrderStatusDistributionChartProps = {
  data: DashboardResponse['charts']['orderStatus'];
};

const OrderStatusDistributionChart: React.FC<OrderStatusDistributionChartProps> = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    label={isMobile ? false : (entry) => `${entry.name}: ${entry.value}`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[STAGES.indexOf(entry.name) % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default OrderStatusDistributionChart;
