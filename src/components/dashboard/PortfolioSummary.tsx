
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const PortfolioSummary = () => {
  const [hasPortfolios, setHasPortfolios] = useState(false);
  
  useEffect(() => {
    // Check if there are portfolios in localStorage
    const savedPortfolios = localStorage.getItem('portfolios');
    if (savedPortfolios) {
      try {
        const portfolios = JSON.parse(savedPortfolios);
        setHasPortfolios(portfolios && portfolios.length > 0);
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
        setHasPortfolios(false);
      }
    } else {
      setHasPortfolios(false);
    }
  }, []);

  if (!hasPortfolios) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Nenhuma carteira encontrada</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Você ainda não adicionou nenhuma carteira de investimentos. 
            Adicione sua primeira carteira para começar a acompanhar seus investimentos.
          </p>
          <Button asChild size="lg">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">R$ 156.789,00</h3>
            <span className="flex items-center text-xs text-green-600 font-semibold">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              +5,2%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            2 carteiras ativas
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-card">
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

      <Card className="gradient-card">
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

      <Card className="gradient-card">
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
