
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Wallet } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AllocationChart from "@/components/charts/AllocationChart";
import { toast } from "@/hooks/use-toast";

interface Portfolio {
  id: number;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = () => {
      setLoading(true);
      try {
        const savedPortfolios = localStorage.getItem('portfolios');
        if (savedPortfolios) {
          const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
          const foundPortfolio = portfolios.find(p => p.id === Number(id));
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          } else {
            toast({
              title: "Carteira não encontrada",
              description: "A carteira solicitada não foi encontrada",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar carteira:", error);
        toast({
          title: "Erro ao carregar carteira",
          description: "Ocorreu um erro ao tentar carregar os dados da carteira",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id]);

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
        <Button className="mt-4 sm:mt-0" asChild>
          <Link to={`/portfolio/${portfolio.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Carteira
          </Link>
        </Button>
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
            <CardTitle>Alocação Atual</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <AllocationChart data={portfolio.allocationData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Esta funcionalidade será implementada em breve.</p>
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
