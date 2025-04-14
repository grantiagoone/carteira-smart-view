
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

const RecentContributionsList = () => {
  const recentContributions = [
    {
      id: 1,
      date: "15/04/2025",
      portfolio: "Carteira Principal",
      amount: "R$ 2.000,00",
      status: "Alocado",
      allocations: [
        { asset: "PETR4", class: "Ações", value: "R$ 600,00" },
        { asset: "MXRF11", class: "FIIs", value: "R$ 500,00" },
        { asset: "Tesouro IPCA+", class: "Renda Fixa", value: "R$ 700,00" },
        { asset: "IVVB11", class: "Internacional", value: "R$ 200,00" },
      ]
    },
    {
      id: 2,
      date: "01/04/2025",
      portfolio: "Aposentadoria",
      amount: "R$ 1.500,00",
      status: "Alocado",
      allocations: [
        { asset: "ITSA4", class: "Ações", value: "R$ 375,00" },
        { asset: "KNRI11", class: "FIIs", value: "R$ 375,00" },
        { asset: "CDB", class: "Renda Fixa", value: "R$ 600,00" },
        { asset: "IVVB11", class: "Internacional", value: "R$ 150,00" },
      ]
    },
  ];

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
        {recentContributions.map((contribution) => (
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
