
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import AllocationChart from "@/components/charts/AllocationChart";
import { AllocationItem } from "@/hooks/portfolio/types";

interface PortfolioAllocationChartProps {
  allocationData: AllocationItem[];
  comparisonData: AllocationItem[];
}

const PortfolioAllocationChart = ({ allocationData, comparisonData }: PortfolioAllocationChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Alocação</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/60 rounded-full mr-2"></div>
              <span className="text-sm text-muted-foreground">Atual</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-sm text-muted-foreground">Ideal</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <AllocationChart 
          data={allocationData} 
          comparisonData={comparisonData}
          showComparison={true}
        />
      </CardContent>
    </Card>
  );
};

export default PortfolioAllocationChart;
