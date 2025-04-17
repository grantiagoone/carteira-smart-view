
import { ArrowRight, ChevronDown } from "lucide-react";
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

  useEffect(() => {
    const loadContributions = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          // Load user-specific contributions
          const userContributions = localStorage.getItem(`contributions_${userId}`);
          if (userContributions) {
            setContributions(JSON.parse(userContributions));
          } else {
            setContributions([]);
          }
        } else {
          setContributions([]);
        }
      } catch (error) {
        console.error("Error loading contributions:", error);
        setContributions([]);
      } finally {
        setLoading(false);
      }
    };

    loadContributions();
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
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/contribution/new">Criar Novo Aporte</Link>
        </Button>
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
