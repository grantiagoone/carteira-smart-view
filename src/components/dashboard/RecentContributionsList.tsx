
import { ArrowRight, ChevronDown, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Contribution {
  id: number;
  date: string;
  portfolio: string;
  amount: string;
  status: string;
  allocations: {
    asset: string;
    class: string;
    value: string;
  }[];
}

const RecentContributionsList = () => {
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
          const portfoliosData = localStorage.getItem(`portfolios_${userId}`);
          const hasUserPortfolios = portfoliosData && JSON.parse(portfoliosData).length > 0;
          setHasPortfolios(hasUserPortfolios);
          
          // Load user-specific contributions
          const userContributions = localStorage.getItem(`contributions_${userId}`);
          if (userContributions) {
            setContributions(JSON.parse(userContributions));
          } else {
            setContributions([]);
          }
        } else {
          setHasPortfolios(false);
          setContributions([]);
        }
      } catch (error) {
        console.error("Error loading contributions:", error);
        setContributions([]);
        setHasPortfolios(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Nenhum aporte encontrado.</p>
        {hasPortfolios ? (
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/contribution/new">Criar Novo Aporte</Link>
          </Button>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm">Você precisa criar uma carteira primeiro</p>
            <Button variant="outline" asChild>
              <Link to="/portfolio/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Carteira
              </Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Carteira</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map((contribution) => (
          <Collapsible key={contribution.id} asChild>
            <>
              <TableRow>
                <TableCell>{contribution.date}</TableCell>
                <TableCell>{contribution.portfolio}</TableCell>
                <TableCell className="text-right font-medium">{contribution.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {contribution.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Detalhes</span>
                      </Button>
                    </CollapsibleTrigger>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/contribution/${contribution.id}`}>
                        <ArrowRight className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4">
                      <p className="font-medium text-sm mb-2">Alocação Sugerida:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {contribution.allocations.map((allocation, idx) => (
                          <div key={idx} className="bg-card p-2 rounded-md border text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{allocation.class}:</span>
                              <span className="font-medium">{allocation.value}</span>
                            </div>
                            <div className="font-medium text-primary">{allocation.asset}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </CollapsibleContent>
            </>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentContributionsList;
