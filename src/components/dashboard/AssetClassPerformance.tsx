
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AssetClassPerformance = () => {
  const data = [
    {
      name: "Ações",
      performance: 15.2,
      color: "#1E40AF"
    },
    {
      name: "FIIs",
      performance: 8.7,
      color: "#0D9488"
    },
    {
      name: "Renda Fixa",
      performance: 6.2,
      color: "#F59E0B"
    },
    {
      name: "Internacional",
      performance: 10.5,
      color: "#6B7280"
    }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'dataMax + 5']}
          />
          <Tooltip 
            formatter={(value) => `${value}%`}
            labelFormatter={(name) => `Classe: ${name}`}
          />
          <Bar dataKey="performance" fill="#1E40AF">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetClassPerformance;
