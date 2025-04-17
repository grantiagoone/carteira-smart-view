
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo } from "react";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  data: ChartData[];
  comparisonData?: ChartData[];
  showComparison?: boolean;
}

const AllocationChart = ({ data, comparisonData, showComparison = false }: AllocationChartProps) => {
  const chartData = useMemo(() => data, [data]);
  const chartComparisonData = useMemo(() => comparisonData, [comparisonData]);

  const outerRadius = showComparison ? 120 : 80;
  const innerRadius = showComparison ? 90 : 0;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {showComparison && chartComparisonData && (
            <Pie
              data={chartComparisonData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartComparisonData.map((entry, index) => (
                <Cell 
                  key={`cell-comparison-${index}`} 
                  fill={entry.color} 
                  opacity={0.6}
                />
              ))}
            </Pie>
          )}
          
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          
          <Tooltip
            formatter={(value: number) => `${value}%`}
            labelFormatter={(name) => `Classe: ${name}`}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
