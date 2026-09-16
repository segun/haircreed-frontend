
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../api/databaseReads';

type SalesOverTimeChartProps = {
  data: DashboardResponse['charts']['salesOverTime'];
};

const SalesOverTimeChart: React.FC<SalesOverTimeChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.bucketStart).toLocaleDateString(),
      sales: item.sales,
    }));
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesOverTimeChart;
