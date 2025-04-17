
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Wallet, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AllocationChart from "@/components/charts/AllocationChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";
import { useMemo } from "react";
import { calculateRebalancingSuggestions } from "@/hooks/portfolio/types";

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolio, loading, deletePortfolio, refreshPrices, isUpdating } = usePortfolio(id);

  const loadingUI = (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  const notFoundUI = (
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

  const calculateCurrentAllocation = useMemo(() => {
    if (!portfolio?.assets || portfolio.assets.length === 0) return [];

    const totalValue = portfolio.assets.reduce((sum, asset) => {
      return sum + (asset.price * (asset.quantity || 0));
    }, 0);

    const allocationGroups: Record<string, number> = {};
    
    portfolio.assets.forEach(asset => {
      const assetValue = asset.price * (asset.quantity || 0);
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
    return loadingUI;
  }

  if (!portfolio) {
    return notFoundUI;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link to="/portfolios">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
          </div>
          <p className="text-muted-foreground">Detalhes e alocação da carteira</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={refreshPrices} disabled={isUpdating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Atualizando...' : 'Atualizar Preços'}
          </Button>
          <Button asChild>
            <Link to={`/portfolio/${portfolio.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Carteira
            </Link>
          </Button>
          <DeletePortfolioDialog portfolioId={portfolio.id} onDelete={deletePortfolio} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor total</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.value)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Retorno</p>
              <div className="flex items-center">
                <p className="text-xl font-medium text-green-600">
                  +{portfolio.returnPercentage}%
                </p>
                <p className="text-sm ml-2 text-muted-foreground">
                  ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.returnValue)})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              data={portfolio.allocationData} 
              comparisonData={calculateCurrentAllocation}
              showComparison={true}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.assets && portfolio.assets.length > 0 ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50 text-xs uppercase">
                        <th className="px-4 py-2 text-left">Ticker</th>
                        <th className="px-4 py-2 text-left">Nome</th>
                        <th className="px-4 py-2 text-right">Preço Atual</th>
                        <th className="px-4 py-2 text-right">Qtd.</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Alocação</th>
                        <th className="px-4 py-2 text-right">Alvo</th>
                        <th className="px-4 py-2 text-right">Ajuste</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {portfolio.assets.map((asset) => {
                        const suggestion = rebalancingSuggestions.find(s => s.asset.id === asset.id);
                        return (
                          <tr key={asset.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 text-left font-medium">{asset.ticker}</td>
                            <td className="px-4 py-3 text-left">{asset.name}</td>
                            <td className="px-4 py-3 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(asset.price))}
                            </td>
                            <td className="px-4 py-3 text-right">{asset.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(asset.price) * asset.quantity)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {suggestion ? `${suggestion.currentAllocation.toFixed(1)}%` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {suggestion ? `${suggestion.targetAllocation.toFixed(1)}%` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {suggestion && (
                                <span className={suggestion.action === 'buy' ? 'text-green-600' : 'text-red-600'}>
                                  {suggestion.action === 'buy' ? '+' : '-'}{suggestion.quantityToAdjust}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Esta carteira não possui ativos cadastrados.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to={`/portfolio/${portfolio.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Gerenciar Ativos
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioDetail;
