
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <div className="text-sm space-y-1">
            {showComparison && payload[1] && (
              <>
                <p>
                  <span className="text-muted-foreground">Ideal: </span>
                  <span className="font-medium">{payload[1].value.toFixed(1)}%</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Atual: </span>
                  <span className="font-medium">{payload[0].value.toFixed(1)}%</span>
                </p>
                <p className="text-xs text-muted-foreground border-t pt-1 mt-1">
                  {Math.abs(payload[1].value - payload[0].value).toFixed(1)}% de diferença
                </p>
              </>
            )}
            {!showComparison && (
              <p>
                <span className="font-medium">{payload[0].value.toFixed(1)}%</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${value.toFixed(0)}%`}
      </text>
    );
  };

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
              label={renderCustomizedLabel}
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
            label={renderCustomizedLabel}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value: string) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
