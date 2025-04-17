
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";

interface Contribution {
  id: number;
  date: string;
  portfolio: string;
  portfolioId: number;
  amount: string;
  status: string;
  allocations: {
    asset: string;
    class: string;
    value: string;
  }[];
}

const Contributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPortfolios, setHasPortfolios] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          // Check if user has any portfolios
          const portfolios = getAllPortfoliosFromStorage(userId);
          setHasPortfolios(portfolios.length > 0);
          
          // Load user-specific contributions
          const storageKey = `contributions_${userId}`;
          const savedContributions = localStorage.getItem(storageKey);
          
          if (savedContributions) {
            setContributions(JSON.parse(savedContributions));
          } else {
            setContributions([]);
          }
        } else {
          setHasPortfolios(false);
          setContributions([]);
        }
      } catch (error) {
        console.error("Error loading contributions:", error);
        toast.error("Erro ao carregar aportes");
        setContributions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Aportes</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus aportes e alocações</p>
        </div>
        <Button className="mt-4 sm:mt-0" asChild disabled={!hasPortfolios}>
          <Link to={hasPortfolios ? "/contribution/new" : "#"}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aporte
          </Link>
        </Button>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Todos os Aportes</CardTitle>
          <CardDescription>
            Histórico completo de aportes e suas respectivas alocações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : contributions.length > 0 ? (
            // Render the existing table with contributions data
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Carteira</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution) => (
                    <tr key={contribution.id} className="border-b">
                      <td className="py-3 px-4">{contribution.date}</td>
                      <td className="py-3 px-4">{contribution.portfolio}</td>
                      <td className="py-3 px-4 text-right font-medium">{contribution.amount}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {contribution.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/contribution/${contribution.id}`}>
                            Ver detalhes
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-6 mt-4">
                Você ainda não possui aportes registrados.
              </p>
              <p className="mb-8">
                {hasPortfolios 
                  ? "Para começar, registre seu primeiro aporte."
                  : "Para começar, primeiro crie uma carteira e depois registre seu primeiro aporte."
                }
              </p>
              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                {!hasPortfolios && (
                  <Button asChild>
                    <Link to="/portfolio/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Carteira
                    </Link>
                  </Button>
                )}
                <Button variant={hasPortfolios ? "default" : "outline"} asChild disabled={!hasPortfolios}>
                  <Link to={hasPortfolios ? "/contribution/new" : "#"}>
                    {hasPortfolios && <Plus className="mr-2 h-4 w-4" />}
                    Registrar Aporte
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {contributions.length > 0 && (
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline">Anterior</Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
            </div>
            <Button variant="outline">Próximo</Button>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Contributions;
