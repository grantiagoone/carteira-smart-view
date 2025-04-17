
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AssetClassPerformanceProps {
  portfolioId?: string | null;
}

const AssetClassPerformance = ({ portfolioId }: AssetClassPerformanceProps) => {
  // Mock data - In a real app, this would come from your API based on the portfolio ID
  const data = [
    { name: 'Ações', performance: 7.2 },
    { name: 'FIIs', performance: 4.5 },
    { name: 'Renda Fixa', performance: 9.8 },
    { name: 'Internacional', performance: -2.3 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Retorno']}
          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          contentStyle={{ 
            borderRadius: '4px', 
            padding: '8px 12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #eaeaea',
          }}
        />
        <Bar 
          dataKey="performance" 
          fill={(entry) => {
            // Fixed TypeScript error by explicitly returning a string
            return entry.performance >= 0 ? "#10b981" : "#ef4444";
          }} 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssetClassPerformance;
