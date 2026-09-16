import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type SalesByPosOperatorChartProps = {
  data: DashboardResponse['charts']['salesByPosOperator'];
};

const SalesByPosOperatorChart: React.FC<SalesByPosOperatorChartProps> = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sales by POS Operator</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="name" 
                    angle={isMobile ? -45 : 0} 
                    textAnchor={isMobile ? 'end' : 'middle'} 
                    height={isMobile ? 80 : 30} 
                    fontSize={isMobile ? 10 : 12}
                />
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
