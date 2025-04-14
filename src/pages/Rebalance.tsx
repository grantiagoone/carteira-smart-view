
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import AllocationChart from "@/components/charts/AllocationChart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

const Rebalance = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState("1");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sample data for current vs target allocation
  const currentAllocation = [
    { name: 'Ações', value: 42, color: '#1E40AF', target: 35 },
    { name: 'FIIs', value: 18, color: '#0D9488', target: 25 },
    { name: 'Renda Fixa', value: 30, color: '#F59E0B', target: 30 },
    { name: 'Internacional', value: 10, color: '#6B7280', target: 10 }
  ];

  const targetAllocation = currentAllocation.map(item => ({
    name: item.name,
    value: item.target,
    color: item.color
  }));

  // Calculate rebalance actions
  const rebalanceActions = currentAllocation.map(item => {
    const diff = item.target - item.value;
    const action = diff > 0 ? 'Comprar' : diff < 0 ? 'Vender' : 'Manter';
    const absValue = Math.abs(diff);
    
    return {
      assetClass: item.name,
      currentPercentage: item.value,
      targetPercentage: item.target,
      diffPercentage: diff,
      action,
      amount: Math.round(Math.abs(diff) * 156789 / 100), // Simplified calculation
      color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
    };
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rebalanceamento</h1>
        <p className="text-muted-foreground">Analise e rebalanceie suas carteiras para manter a estratégia alinhada</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-64">
            <label htmlFor="portfolio-select" className="block text-sm font-medium text-gray-700 mb-1">
              Selecione a Carteira
            </label>
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma carteira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Carteira Principal</SelectItem>
                <SelectItem value="2">Aposentadoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Atualizar Análise</Button>
        </div>
      </div>

      <Card className="gradient-card mb-6">
        <CardHeader>
          <CardTitle>Status do Rebalanceamento</CardTitle>
          <CardDescription>
            Carteira Principal - R$ 156.789,00
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-medium mb-4">Resumo do Desbalanceamento</h3>
              <div className="space-y-6">
                {rebalanceActions.map((action, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{action.assetClass}</span>
                      <span className={action.color}>
                        {action.diffPercentage > 0 ? '+' : ''}{action.diffPercentage}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary">
                            Atual: {action.currentPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold inline-block text-secondary">
                            Meta: {action.targetPercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-muted">
                        <div 
                          style={{ width: `${action.currentPercentage}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                        />
                      </div>
                      <div className="overflow-hidden h-1 mb-1 text-xs flex rounded bg-muted mt-1">
                        <div 
                          style={{ width: `${action.targetPercentage}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h3 className="font-medium mb-4 text-center">Alocação Atual</h3>
                <AllocationChart data={currentAllocation} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-4 text-center">Alocação Alvo</h3>
                <AllocationChart data={targetAllocation} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Collapsible 
            open={isDetailsOpen} 
            onOpenChange={setIsDetailsOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between">
                <span>Ações Sugeridas para Rebalanceamento</span>
                {isDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 border rounded-md p-4 bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-2">Classe de Ativo</th>
                      <th className="pb-2">Ação</th>
                      <th className="pb-2 text-right">Valor Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rebalanceActions.map((action, index) => (
                      action.diffPercentage !== 0 && (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3">{action.assetClass}</td>
                          <td className={`py-3 ${action.color}`}>{action.action}</td>
                          <td className={`py-3 text-right ${action.color}`}>
                            R$ {action.amount.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <Button>
                    Iniciar Rebalanceamento
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Histórico de Rebalanceamentos</CardTitle>
          <CardDescription>
            Registro das ações de rebalanceamento realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Rebalanceamento Completo</p>
                <p className="text-sm text-muted-foreground">01/04/2025</p>
              </div>
              <Button variant="outline" size="sm">Detalhes</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Ajuste Parcial</p>
                <p className="text-sm text-muted-foreground">15/03/2025</p>
              </div>
              <Button variant="outline" size="sm">Detalhes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Rebalance;
