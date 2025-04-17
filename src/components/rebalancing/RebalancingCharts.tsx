
import AllocationChart from "@/components/charts/AllocationChart";

interface RebalancingChartsProps {
  currentAllocation: { name: string; value: number; color: string; target: number }[];
  targetAllocation: { name: string; value: number; color: string }[];
}

const RebalancingCharts = ({ currentAllocation, targetAllocation }: RebalancingChartsProps) => {
  return (
    <>
      <div className="flex-1">
        <h3 className="font-medium mb-4 text-center">Alocação Atual</h3>
        <AllocationChart data={currentAllocation} />
      </div>
      <div className="flex-1">
        <h3 className="font-medium mb-4 text-center">Alocação Alvo</h3>
        <AllocationChart data={targetAllocation} />
      </div>
    </>
  );
};

export default RebalancingCharts;
