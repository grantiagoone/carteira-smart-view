import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { Portfolio } from "@/hooks/portfolio/types";
import { toast } from "sonner";
import { useRebalancing } from "@/hooks/rebalancing/useRebalancing";
import HistoryItem from "@/components/rebalancing/HistoryItem";
import FilterControls from "@/components/rebalancing/FilterControls";
import PortfolioSelector from "@/components/rebalancing/PortfolioSelector";
import RebalancingStatusCard from "@/components/rebalancing/RebalancingStatusCard";

const Rebalance = () => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
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
    repeatRebalance,
    filteredActions
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
  
  const executeRebalancing = () => {
    const portfolio = portfolios.find(p => p.id.toString() === selectedPortfolioId);
    if (portfolio && filteredActions.some(action => action.diffPercentage !== 0)) {
      saveRebalancing(
        portfolio.id.toString(),
        portfolio.name || "Carteira sem nome",
        filteredActions
      );
    } else {
      toast.info("Não há alterações para executar");
    }
  };

  // Memoize UI components
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

  // Calculate rebalancing when the selected portfolio changes
  useEffect(() => {
    const calculateRebalancing = (portfolio: Portfolio) => {
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
    };

    const selectedPortfolio = portfolios.find(p => p.id.toString() === selectedPortfolioId);
    if (selectedPortfolio) {
      calculateRebalancing(selectedPortfolio);
    }
  }, [selectedPortfolioId, portfolios]);

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

  const selectedPortfolio = portfolios.find(p => p.id.toString() === selectedPortfolioId);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rebalanceamento</h1>
        <p className="text-muted-foreground">Analise e rebalanceie suas carteiras para manter a estratégia alinhada</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PortfolioSelector
            portfolios={portfolios}
            selectedPortfolioId={selectedPortfolioId}
            onPortfolioChange={handlePortfolioChange}
          />
          
          <div className="flex gap-2">
            <Button onClick={handleUpdateAnalysis} variant="outline">
              Atualizar Análise
            </Button>
            
            <Button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              variant="secondary"
            >
              Opções Avançadas
            </Button>
          </div>
        </div>
        
        <FilterControls onFilterChange={handleFilterChange} />
      </div>

      {selectedPortfolio && (
        <RebalancingStatusCard
          portfolio={selectedPortfolio}
          filteredActions={filteredActions}
          isDetailsOpen={isDetailsOpen}
          onToggleDetails={setIsDetailsOpen}
          onExecute={executeRebalancing}
          isExecuting={isExecuting}
          currentAllocation={currentAllocation}
          targetAllocation={targetAllocation}
        />
      )}

      <Card className="gradient-card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Histórico de Rebalanceamentos</h2>
          <p className="text-muted-foreground mb-6">
            Registro das ações de rebalanceamento realizadas
          </p>
          
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
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default React.memo(Rebalance);
