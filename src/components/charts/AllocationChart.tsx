
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo } from "react";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  data: ChartData[];
}

const AllocationChart = ({ data }: AllocationChartProps) => {
  // Memoize data to prevent unnecessary re-renders and ensure labels are up to date
  const chartData = useMemo(() => data, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value}%`}
            labelFormatter={(name) => `Classe: ${name}`}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
