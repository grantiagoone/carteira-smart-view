
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { usePortfolio } from "@/hooks/usePortfolio";
import { Portfolio, AllocationItem } from "@/hooks/portfolio/types";

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
  const [currentAllocation, setCurrentAllocation] = useState<{name: string; value: number; color: string; target: number}[]>([]);
  const [targetAllocation, setTargetAllocation] = useState<{name: string; value: number; color: string;}[]>([]);
  
  // Use the usePortfolio hook to get portfolio details when selectedPortfolioId changes
  const { portfolio: selectedPortfolio } = usePortfolio(selectedPortfolioId || undefined);

  // Load portfolios
  useEffect(() => {
    const loadUserPortfolios = async () => {
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
        } else {
          setPortfolios([]);
        }
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserPortfolios();
  }, []);

  // Memoize the calculation function to prevent recreating it on every render
  const calculateRebalancing = useCallback((portfolio: Portfolio) => {
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
  }, []);

  // Update the rebalancing calculation when the portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      calculateRebalancing(selectedPortfolio);
    }
  }, [selectedPortfolio, calculateRebalancing]);

  const handlePortfolioChange = useCallback((value: string) => {
    setSelectedPortfolioId(value);
  }, []);

  const handleUpdateAnalysis = useCallback(() => {
    if (selectedPortfolio) {
      calculateRebalancing(selectedPortfolio);
      toast.success("Análise de rebalanceamento atualizada");
    }
  }, [selectedPortfolio, calculateRebalancing]);

  // Memoize the allocation charts to prevent unnecessary re-renders
  const currentAllocationChart = useMemo(() => (
    <AllocationChart data={currentAllocation} />
  ), [currentAllocation]);

  const targetAllocationChart = useMemo(() => (
    <AllocationChart data={targetAllocation} />
  ), [targetAllocation]);

  // Memoize the empty state UI to prevent re-renders
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

  // Memoize the loading UI to prevent re-renders
  const loadingUI = useMemo(() => (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ), []);

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
          <Button onClick={handleUpdateAnalysis}>
            Atualizar Análise
          </Button>
        </div>
      </div>

      {selectedPortfolio && (
        <Card className="gradient-card mb-6">
          <CardHeader>
            <CardTitle>Status do Rebalanceamento</CardTitle>
            <CardDescription>
              {selectedPortfolio.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.value || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h3 className="font-medium mb-4">Resumo do Desbalanceamento</h3>
                <div className="space-y-6">
                  {rebalanceActions.map((action, index) => (
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
                      {rebalanceActions.map((action, index) => (
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
                    <Button>
                      Iniciar Rebalanceamento
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Nenhum rebalanceamento encontrado</p>
                  <p className="text-sm text-muted-foreground">Inicie seu primeiro rebalanceamento</p>
                </div>
                <Button variant="outline" size="sm">Iniciar</Button>
              </div>
            </div>
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
