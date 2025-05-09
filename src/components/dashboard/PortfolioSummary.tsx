
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { Portfolio } from "@/hooks/portfolio/types";

interface PortfolioSummaryProps {
  selectedPortfolioId?: string | null;
}

const PortfolioSummary = ({ selectedPortfolioId }: PortfolioSummaryProps) => {
  const [hasPortfolios, setHasPortfolios] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [averageReturn, setAverageReturn] = useState(0);
  const [lastContribution, setLastContribution] = useState<{amount: number, date: string} | null>(null);
  const [allocationDifference, setAllocationDifference] = useState(0);
  
  useEffect(() => {
    const loadUserPortfolios = async () => {
      setLoading(true);
      
      try {
        // Get the current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        // If we have a user, load their portfolios
        if (userId) {
          const userPortfolios = getAllPortfoliosFromStorage(userId);
          setHasPortfolios(userPortfolios && userPortfolios.length > 0);
          
          if (userPortfolios && userPortfolios.length > 0) {
            let portfoliosToCalculate: Portfolio[] = userPortfolios;
            
            // Filter by selected portfolio if one is selected
            if (selectedPortfolioId) {
              const selectedPortfolio = userPortfolios.find(p => p.id.toString() === selectedPortfolioId);
              if (selectedPortfolio) {
                portfoliosToCalculate = [selectedPortfolio];
              }
            }
            
            // Calculate total value and average return
            const total = portfoliosToCalculate.reduce((sum, p) => sum + p.value, 0);
            setTotalValue(total);
            
            // Count portfolios
            setPortfolioCount(selectedPortfolioId ? 1 : userPortfolios.length);
            
            // Calculate weighted average return
            const weightedReturn = portfoliosToCalculate.reduce((sum, p) => {
              return sum + (p.returnPercentage * p.value);
            }, 0);
            
            setAverageReturn(total > 0 ? weightedReturn / total : 0);
            
            // Find last contribution if any
            const contributionHistory = JSON.parse(localStorage.getItem(`contributions_${userId}`) || '[]');
            if (contributionHistory && contributionHistory.length > 0) {
              // Filter contributions by portfolio if one is selected
              const relevantContributions = selectedPortfolioId
                ? contributionHistory.filter((c: any) => c.portfolioId === selectedPortfolioId)
                : contributionHistory;
                
              if (relevantContributions.length > 0) {
                const latest = relevantContributions[0]; // Assuming sorted by date
                setLastContribution({
                  amount: latest.amount,
                  date: latest.date
                });
              } else {
                setLastContribution(null);
              }
            }
            
            // Calculate allocation difference (mock data for now)
            setAllocationDifference(selectedPortfolioId ? 8 : 5);
          } else {
            // No portfolios, clear all data
            setTotalValue(0);
            setPortfolioCount(0);
            setAverageReturn(0);
            setLastContribution(null);
            setAllocationDifference(0);
          }
        } else {
          // User not logged in, show empty state
          setHasPortfolios(false);
        }
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
        setHasPortfolios(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserPortfolios();
  }, [selectedPortfolioId]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-lg">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasPortfolios) {
    return (
      <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-lg">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Nenhuma carteira encontrada</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Você ainda não adicionou nenhuma carteira de investimentos. 
            Adicione sua primeira carteira para começar a acompanhar seus investimentos.
          </p>
          <Button asChild size="lg" className="investeja-button">
            <Link to="/portfolio/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Carteira
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="investeja-card">
        <CardContent className="p-0">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </h3>
              {averageReturn > 0 && (
                <span className="flex items-center text-xs text-green-600 font-semibold">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{averageReturn.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolioCount} {portfolioCount === 1 ? 'carteira ativa' : 'carteiras ativas'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-0">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-muted-foreground">Rentabilidade</p>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">{averageReturn > 0 ? `+${averageReturn.toFixed(1)}%` : '0%'}</h3>
              <span className="text-xs text-muted-foreground">
                no ano
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {averageReturn > 0 ? `+${(averageReturn / 3).toFixed(1)}%` : '0%'} último mês
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-0">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Aportado</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue * 0.9)}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastContribution 
                ? `Último aporte: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lastContribution.amount)} (${lastContribution.date})`
                : 'Nenhum aporte recente'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-0">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-muted-foreground">Status Alocação</p>
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">{allocationDifference}%</h3>
              <span className="text-xs text-muted-foreground">
                de diferença
              </span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Rebalanceamento recomendado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
