
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChartPie, DollarSign, Plus, Wallet } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import AllocationChart from "@/components/charts/AllocationChart";
import RecentContributionsList from "@/components/dashboard/RecentContributionsList";
import AssetClassPerformance from "@/components/dashboard/AssetClassPerformance";
import WelcomeModal from "@/components/modals/WelcomeModal";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
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

  return (
    <DashboardLayout>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold text-primary">Visão Geral</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie suas carteiras de investimentos</p>
        </div>
        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
            <Link to="/portfolio/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Link>
          </Button>
          {hasPortfolios && (
            <Button asChild className="investeja-button">
              <Link to="/contribution/new">
                <DollarSign className="mr-2 h-4 w-4" />
                Novo Aporte
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <PortfolioSummary />
      
      {hasPortfolios ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="investeja-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Alocação Atual</CardTitle>
                <ChartPie className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <AllocationChart 
                  data={[
                    { name: 'Ações', value: 35, color: '#ea384c' },
                    { name: 'FIIs', value: 25, color: '#222' },
                    { name: 'Renda Fixa', value: 30, color: '#f97316' },
                    { name: 'Internacional', value: 10, color: '#6B7280' }
                  ]} 
                />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
                  <Link to="/portfolios">Ver Detalhes</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="investeja-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Desempenho por Classe</CardTitle>
                <BarChart3 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="pt-4">
                <AssetClassPerformance />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
                  <Link to="/performance">Análise Detalhada</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="investeja-card mb-8">
            <CardHeader>
              <CardTitle>Aportes Recentes</CardTitle>
              <CardDescription>Veja seus últimos aportes e as alocações sugeridas</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentContributionsList />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
                <Link to="/contributions">Ver Todos</Link>
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : null}
      
      <div className="investeja-section rounded-lg mb-8">
        <div className="investeja-container">
          <h2 className="text-3xl font-bold mb-4">Calculadora de juros compostos com aportes</h2>
          <p className="text-lg mb-8">
            Com a possibilidade de reajustes, nossa calculadora oferece uma maneira simples e eficiente 
            de calcular seus juros compostos e acompanhar o crescimento dos seus investimentos ao longo do tempo. 
            Com apenas alguns cliques, você pode simular diferentes cenários, incluindo aportes periódicos, 
            e obter uma visão clara do seu potencial de crescimento financeiro.
          </p>
          
          <Button className="investeja-button" asChild>
            <Link to="/calculator">
              <DollarSign className="mr-2 h-4 w-4" />
              Usar Calculadora
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-secondary text-white p-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Ficou com alguma dúvida ou interessado?</h2>
          </div>
          <div>
            <p className="mb-4">
              Estamos aqui para sermos seu parceiro na jornada de transformação financeira e de vida. 
              Entre em contato conosco pelos meios abaixo, sem qualquer custo adicional.
            </p>
            <div className="space-y-2 mt-6">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <span>investejacontato@gmail.com</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <span>(16) 99625-9434</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
