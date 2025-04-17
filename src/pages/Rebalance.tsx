
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ChevronRight, ChevronDown, Wallet, Plus } from "lucide-react";
import AllocationChart from "@/components/charts/AllocationChart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";

interface Portfolio {
  id: number;
  name: string;
  value: number;
  allocationData: {
    name: string;
    value: number;
    color: string;
  }[];
}

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
          
          // Select first portfolio if exists
          if (userPortfolios && userPortfolios.length > 0) {
            setSelectedPortfolioId(userPortfolios[0].id.toString());
            calculateRebalancing(userPortfolios[0]);
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

  const calculateRebalancing = (portfolio: Portfolio) => {
    if (!portfolio || !portfolio.allocationData) return;
    
    // Define target allocation (could be from portfolio settings or predefined)
    const portfolioValue = portfolio.value || 100000; // Default for calculation

    // For this example, let's assume some targets based on names
    const targetMap: Record<string, number> = {
      'Ações': 35,
      'FIIs': 25,
      'Renda Fixa': 30,
      'Internacional': 10
    };
    
    // Create current allocation with targets
    const current = portfolio.allocationData.map(item => ({
      ...item,
      target: targetMap[item.name] || item.value // Use existing value as target if no mapping
    }));
    
    setCurrentAllocation(current);
    
    // Create target allocation for chart
    const target = current.map(item => ({
      name: item.name,
      value: item.target,
      color: item.color
    }));
    
    setTargetAllocation(target);
    
    // Calculate rebalance actions
    const actions = current.map(item => {
      const diff = item.target - item.value;
      const action = diff > 0 ? 'Comprar' : diff < 0 ? 'Vender' : 'Manter';
      const absValue = Math.abs(diff);
      
      return {
        assetClass: item.name,
        currentPercentage: item.value,
        targetPercentage: item.target,
        diffPercentage: diff,
        action,
        amount: Math.round(Math.abs(diff) * portfolioValue / 100), // Calculate actual amount
        color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
      };
    });
    
    setRebalanceActions(actions);
  };

  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolioId(value);
    const selected = portfolios.find(p => p.id.toString() === value);
    if (selected) {
      calculateRebalancing(selected);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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
          <Button onClick={() => selectedPortfolio && calculateRebalancing(selectedPortfolio)}>
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
                  <AllocationChart data={currentAllocation} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-4 text-center">Alocação Alvo</h3>
                  <AllocationChart data={targetAllocation} />
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

export default Rebalance;
