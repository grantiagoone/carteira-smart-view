import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, Wallet, Plus } from "lucide-react";
import AllocationChart from "@/components/charts/AllocationChart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { toast } from "sonner";
import { Portfolio } from "@/hooks/portfolio/types";
import RebalancingActions from "@/components/rebalancing/RebalancingActions";
import FilterControls from "@/components/rebalancing/FilterControls";
import HistoryItem from "@/components/rebalancing/HistoryItem";
import { useRebalancing } from "@/hooks/rebalancing/useRebalancing";

interface RebalanceAction {
  assetClass: string;
  currentPercentage: number;
  targetPercentage: number;
  diffPercentage: number;
  action: string;
  amount: number;
  color: string;
}

const Rebalance = () => {
  const navigate = useNavigate();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<RebalanceAction[]>([]);
  const [currentAllocation, setCurrentAllocation] = useState<{name: string; value: number; color: string; target: number}[]>([]);
  const [targetAllocation, setTargetAllocation] = useState<{name: string; value: number; color: string;}[]>([]);
  
  // Use the rebalancing hook
  const { 
    isExecuting,
    history,
    loadHistory,
    saveRebalancing,
    handleFilterChange,
    viewRebalanceDetails,
    repeatRebalance
  } = useRebalancing(selectedPortfolioId || undefined);

  // Load portfolios and history
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const userPortfolios = getAllPortfoliosFromStorage(userId);
          setPortfolios(userPortfolios || []);
          
          // Select first portfolio if exists and no portfolio is currently selected
          if (userPortfolios && userPortfolios.length > 0 && !selectedPortfolioId) {
            setSelectedPortfolioId(userPortfolios[0].id.toString());
          }
          
          // Load rebalancing history
          loadHistory();
        } else {
          setPortfolios([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [loadHistory, selectedPortfolioId]);

  // Memoize the calculation function
  const calculateRebalancing = useMemo(() => (portfolio: Portfolio) => {
    if (!portfolio || !portfolio.allocationData) {
      console.log("Portfolio or allocation data is missing");
      return;
    }
    
    const portfolioValue = portfolio.value || 100000; // Default for calculation
    
    // Use the portfolio's own allocation data for targets
    const allocationData = portfolio.allocationData;
    
    // Create current allocation - in a real app, this would be calculated from assets
    // For this example, we'll create some variation to show rebalancing needs
    const current = allocationData.map(item => {
      // Create some variation for demo purposes
      // In a real app, this would be calculated from actual holdings
      const seed = item.name.charCodeAt(0) % 10; // Deterministic variation based on name
      const currentValue = Math.max(0, Math.min(100, 
        item.value + (seed > 5 ? 15 : -15)
      ));
      
      return {
        name: item.name,
        value: currentValue,
        color: item.color,
        target: item.value // The original allocation is our target
      };
    });
    
    // Normalize current values to ensure they sum to 100%
    const totalCurrent = current.reduce((sum, item) => sum + item.value, 0);
    const normalizedCurrent = current.map(item => ({
      ...item,
      value: Math.round((item.value / totalCurrent) * 100)
    }));
    
    setCurrentAllocation(normalizedCurrent);
    
    // Create target allocation for chart using the portfolio's original allocation
    const target = allocationData.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color
    }));
    
    setTargetAllocation(target);
    
    // Calculate rebalance actions
    const actions = normalizedCurrent.map(item => {
      const diff = item.target - item.value;
      const action = diff > 0 ? 'Comprar' : diff < 0 ? 'Vender' : 'Manter';
      
      return {
        assetClass: item.name,
        currentPercentage: item.value,
        targetPercentage: item.target,
        diffPercentage: diff,
        action,
        amount: Math.round(Math.abs(diff) * portfolioValue / 100),
        color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
      };
    });
    
    setRebalanceActions(actions);
    setFilteredActions(actions);
  }, []);

  // Fix for PortfolioPick integration
  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolioId(value);
  };

  const handleUpdateAnalysis = () => {
    const portfolio = portfolios.find(p => p.id.toString() === selectedPortfolioId);
    if (portfolio) {
      calculateRebalancing(portfolio);
      toast.success("Análise de rebalanceamento atualizada");
    }
  };
  
  const handleFiltersChange = (filters: any) => {
    const filtered = handleFilterChange(rebalanceActions, filters);
    setFilteredActions(filtered);
  };
  
  const executeRebalancing = () => {
    const portfolio = portfolios.find(p => p.id.toString() === selectedPortfolioId);
    if (portfolio && rebalanceActions.some(action => action.diffPercentage !== 0)) {
      saveRebalancing(
        portfolio.id.toString(),
        portfolio.name || "Carteira sem nome",
        rebalanceActions
      );
    } else {
      toast.info("Não há alterações para executar");
    }
  };

  // Memoize UI components to prevent re-renders
  const emptyStateUI = useMemo(() => (
    <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-lg">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Nenhuma carteira encontrada</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Você precisa adicionar pelo menos uma carteira para utilizar o rebalanceamento.
          Adicione sua primeira carteira para começar.
        </p>
        <Button asChild size="lg" className="investeja-button">
          <Link to="/portfolio/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Carteira
          </Link>
        </Button>
      </CardContent>
    </Card>
  ), []);

  const loadingUI = useMemo(() => (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ), []);
  
  const emptyHistoryUI = useMemo(() => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        Nenhum rebalanceamento realizado ainda. Execute seu primeiro rebalanceamento para ver o histórico.
      </p>
    </div>
  ), []);

  // Use the findPortfolio function to get the selected portfolio
  const selectedPortfolio = useMemo(() => {
    return portfolios.find(p => p.id.toString() === selectedPortfolioId);
  }, [portfolios, selectedPortfolioId]);

  // Calculate rebalancing when the selected portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      calculateRebalancing(selectedPortfolio);
    }
  }, [selectedPortfolio, calculateRebalancing]);

  if (loading) {
    return (
      <DashboardLayout>
        {loadingUI}
      </DashboardLayout>
    );
  }

  // Show empty state if no portfolios
  if (portfolios.length === 0) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Rebalanceamento</h1>
          <p className="text-muted-foreground">Analise e rebalanceie suas carteiras para manter a estratégia alinhada</p>
        </div>
        
        {emptyStateUI}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rebalanceamento</h1>
        <p className="text-muted-foreground">Analise e rebalanceie suas carteiras para manter a estratégia alinhada</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-64">
            <label htmlFor="portfolio-select" className="block text-sm font-medium text-gray-700 mb-1">
              Selecione a Carteira
            </label>
            <Select value={selectedPortfolioId || ''} onValueChange={handlePortfolioChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma carteira" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleUpdateAnalysis} variant="outline">
              Atualizar Análise
            </Button>
            
            <Button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              variant="secondary"
            >
              Opções Avançadas {isDetailsOpen ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleContent>
            <div className="mt-4">
              <FilterControls onFilterChange={handleFiltersChange} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {selectedPortfolio && (
        <Card className="gradient-card mb-6">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Status do Rebalanceamento</CardTitle>
              <CardDescription>
                {selectedPortfolio.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.value || 0)}
              </CardDescription>
            </div>
            
            <RebalancingActions 
              onExecute={executeRebalancing} 
              hasChanges={rebalanceActions.some(action => action.diffPercentage !== 0)}
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h3 className="font-medium mb-4">Resumo do Desbalanceamento</h3>
                <div className="space-y-6">
                  {filteredActions.map((action, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{action.assetClass}</span>
                        <span className={action.color}>
                          {action.diffPercentage > 0 ? '+' : ''}{action.diffPercentage}%
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-primary">
                              Atual: {action.currentPercentage}%
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold inline-block text-secondary">
                              Meta: {action.targetPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-muted">
                          <div 
                            style={{ width: `${action.currentPercentage}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                          />
                        </div>
                        <div className="overflow-hidden h-1 mb-1 text-xs flex rounded bg-muted mt-1">
                          <div 
                            style={{ width: `${action.targetPercentage}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:w-1/2 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="font-medium mb-4 text-center">Alocação Atual</h3>
                  {currentAllocationChart}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-4 text-center">Alocação Alvo</h3>
                  {targetAllocationChart}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Collapsible 
              open={isDetailsOpen} 
              onOpenChange={setIsDetailsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between">
                  <span>Ações Sugeridas para Rebalanceamento</span>
                  {isDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 border rounded-md p-4 bg-card">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b">
                        <th className="pb-2">Classe de Ativo</th>
                        <th className="pb-2">Ação</th>
                        <th className="pb-2 text-right">Valor Estimado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions.map((action, index) => (
                        action.diffPercentage !== 0 && (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3">{action.assetClass}</td>
                            <td className={`py-3 ${action.color}`}>{action.action}</td>
                            <td className={`py-3 text-right ${action.color}`}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(action.amount)}
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={executeRebalancing} 
                      disabled={isExecuting || !rebalanceActions.some(action => action.diffPercentage !== 0)}
                    >
                      {isExecuting ? "Processando..." : "Executar Rebalanceamento"}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardFooter>
        </Card>
      )}

      {/* History Section - Will only be shown if we have portfolios */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Histórico de Rebalanceamentos</CardTitle>
          <CardDescription>
            Registro das ações de rebalanceamento realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {portfolios.length > 0 ? (
            history.length > 0 ? (
              <div className="space-y-4">
                {history.slice(0, 5).map((item) => (
                  <HistoryItem 
                    key={item.id} 
                    item={item} 
                    onView={viewRebalanceDetails}
                    onRepeat={repeatRebalance}
                  />
                ))}
                
                {history.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm">
                      Ver Todos os Rebalanceamentos
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              emptyHistoryUI
            )
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              Você precisa adicionar uma carteira para visualizar o histórico de rebalanceamentos.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default React.memo(Rebalance);
