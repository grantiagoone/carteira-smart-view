
import { useParams } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePortfolio } from "@/hooks/usePortfolio";
import { calculateRebalancingSuggestions } from "@/hooks/portfolio/types";
import { useMemo } from "react";
import PortfolioHeader from "@/components/portfolios/detail/PortfolioHeader";
import PortfolioSummary from "@/components/portfolios/detail/PortfolioSummary";
import PortfolioAllocationChart from "@/components/portfolios/detail/PortfolioAllocationChart";
import PortfolioAssetsTable from "@/components/portfolios/detail/PortfolioAssetsTable";

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolio, loading, deletePortfolio, refreshPrices, isUpdating } = usePortfolio(id);

  const calculateCurrentAllocation = useMemo(() => {
    if (!portfolio?.assets || portfolio.assets.length === 0) return [];

    const totalValue = portfolio.assets.reduce((sum, asset) => {
      return sum + (Number(asset.price) * Number(asset.quantity || 0));
    }, 0);

    const allocationGroups: Record<string, number> = {};
    
    portfolio.assets.forEach(asset => {
      const assetValue = Number(asset.price) * Number(asset.quantity || 0);
      const assetType = asset.type || 'stock';
      
      if (allocationGroups[assetType]) {
        allocationGroups[assetType] += assetValue;
      } else {
        allocationGroups[assetType] = assetValue;
      }
    });

    return Object.entries(allocationGroups).map(([name, value]) => {
      const matchingAllocation = portfolio.allocationData.find(a => a.name === name);
      return {
        name,
        value: Number(((value / totalValue) * 100).toFixed(2)),
        color: matchingAllocation?.color || '#' + Math.floor(Math.random()*16777215).toString(16)
      };
    });
  }, [portfolio]);

  const rebalancingSuggestions = useMemo(() => {
    if (!portfolio) return [];
    return calculateRebalancingSuggestions(portfolio);
  }, [portfolio]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-medium mb-2">Carteira não encontrada</h2>
          <p className="text-muted-foreground mb-4">A carteira solicitada não foi encontrada</p>
          <Button asChild>
            <Link to="/portfolios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Carteiras
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PortfolioHeader 
        portfolio={portfolio}
        isUpdating={isUpdating}
        onRefreshPrices={refreshPrices}
        onDelete={deletePortfolio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioSummary portfolio={portfolio} />
        <PortfolioAllocationChart 
          allocationData={portfolio.allocationData}
          comparisonData={calculateCurrentAllocation}
        />
        <PortfolioAssetsTable 
          portfolio={portfolio}
          rebalancingSuggestions={rebalancingSuggestions}
        />
      </div>
    </DashboardLayout>
  );
};

export default PortfolioDetail;
