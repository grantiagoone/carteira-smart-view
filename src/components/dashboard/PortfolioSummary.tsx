import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";

const PortfolioSummary = () => {
  const [hasPortfolios, setHasPortfolios] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [averageReturn, setAverageReturn] = useState(0);
  
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
            // Calculate total value and average return
            const total = userPortfolios.reduce((sum, p) => sum + p.value, 0);
            setTotalValue(total);
            
            // Count portfolios
            setPortfolioCount(userPortfolios.length);
            
            // Calculate weighted average return
            const weightedReturn = userPortfolios.reduce((sum, p) => {
              return sum + (p.returnPercentage * p.value);
            }, 0);
            
            setAverageReturn(total > 0 ? weightedReturn / total : 0);
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
  }, []);

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
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </h3>
            <span className="flex items-center text-xs text-green-600 font-semibold">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              +{averageReturn.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {portfolioCount} {portfolioCount === 1 ? 'carteira ativa' : 'carteiras ativas'}
          </p>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Rentabilidade</p>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">+12,8%</h3>
            <span className="text-xs text-muted-foreground">
              no ano
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +3,5% último mês
          </p>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Aportado</p>
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">R$ 140.500,00</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Último aporte: R$ 2.000 (15/04)
          </p>
        </CardContent>
      </Card>

      <Card className="investeja-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Status Alocação</p>
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">8%</h3>
            <span className="text-xs text-muted-foreground">
              de diferença
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Rebalanceamento recomendado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
