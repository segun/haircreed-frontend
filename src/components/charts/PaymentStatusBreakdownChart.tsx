import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const COLORS = ['#0088FE', '#FFBB28'];

type PaymentStatusBreakdownChartProps = {
  data: DashboardResponse['charts']['paymentStatus'];
};

const PaymentStatusBreakdownChart: React.FC<PaymentStatusBreakdownChartProps> = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Payment Status Breakdown</h3>
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
                    {data.map((_entry, index) => (
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
