
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AllocationChart from "@/components/charts/AllocationChart";

// Dados iniciais de carteiras
const initialPortfolios = [
  {
    id: 1,
    name: "Carteira Principal",
    value: 124680.50,
    returnPercentage: 12.5,
    returnValue: 13850.30,
    allocationData: [
      { name: 'Ações', value: 35, color: '#1E40AF' },
      { name: 'FIIs', value: 25, color: '#0D9488' },
      { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
      { name: 'Internacional', value: 10, color: '#6B7280' }
    ]
  },
  {
    id: 2,
    name: "Aposentadoria",
    value: 32108.50,
    returnPercentage: 8.7,
    returnValue: 2570.40,
    allocationData: [
      { name: 'Ações', value: 20, color: '#1E40AF' },
      { name: 'FIIs', value: 15, color: '#0D9488' },
      { name: 'Renda Fixa', value: 60, color: '#F59E0B' },
      { name: 'Internacional', value: 5, color: '#6B7280' }
    ]
  }
];

const Portfolios = () => {
  // Estado para armazenar as carteiras
  const [portfolios, setPortfolios] = useState(initialPortfolios);

  // Efeito para carregar carteiras do localStorage ao montar o componente
  useEffect(() => {
    const savedPortfolios = localStorage.getItem('portfolios');
    if (savedPortfolios) {
      try {
        setPortfolios(JSON.parse(savedPortfolios));
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
      }
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carteiras</h1>
          <p className="text-muted-foreground">Gerencie suas carteiras de investimentos</p>
        </div>
        <Button className="mt-4 sm:mt-0" asChild>
          <Link to="/portfolio/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Carteira
          </Link>
        </Button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mt-4 text-lg font-medium">Nenhuma carteira cadastrada</h2>
          <p className="mt-1 text-muted-foreground">Crie sua primeira carteira para começar</p>
          <Button className="mt-4" asChild>
            <Link to="/portfolio/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="gradient-card">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span>{portfolio.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.value)}
                    </div>
                    <div className="text-sm text-green-600">
                      +{portfolio.returnPercentage}% 
                      <span className="text-muted-foreground ml-1">
                        ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.returnValue)})
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart data={portfolio.allocationData} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/portfolio/${portfolio.id}`}>
                    Ver Detalhes
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/portfolio/${portfolio.id}/edit`}>
                    Editar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Portfolios;
