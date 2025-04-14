
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronDown, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Contributions = () => {
  const contributions = [
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
    {
      id: 3,
      date: "15/03/2025",
      portfolio: "Carteira Principal",
      amount: "R$ 2.000,00",
      status: "Alocado",
      allocations: [
        { asset: "WEGE3", class: "Ações", value: "R$ 600,00" },
        { asset: "HGLG11", class: "FIIs", value: "R$ 500,00" },
        { asset: "LCI", class: "Renda Fixa", value: "R$ 700,00" },
        { asset: "IVVB11", class: "Internacional", value: "R$ 200,00" },
      ]
    },
    {
      id: 4,
      date: "01/03/2025",
      portfolio: "Aposentadoria",
      amount: "R$ 1.500,00",
      status: "Alocado",
      allocations: [
        { asset: "BBAS3", class: "Ações", value: "R$ 375,00" },
        { asset: "XPLG11", class: "FIIs", value: "R$ 375,00" },
        { asset: "LCA", class: "Renda Fixa", value: "R$ 600,00" },
        { asset: "HASH11", class: "Internacional", value: "R$ 150,00" },
      ]
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Aportes</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus aportes e alocações</p>
        </div>
        <Button className="mt-4 sm:mt-0" asChild>
          <Link to="/contribution/new">
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
                            <p className="font-medium text-sm mb-2">Alocação Realizada:</p>
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
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Anterior</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-primary text-primary-foreground">2</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
          </div>
          <Button variant="outline">Próximo</Button>
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
};

export default Contributions;
