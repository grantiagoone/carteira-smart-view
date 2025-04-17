
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Portfolio } from "@/hooks/portfolio/types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import RebalanceActionList from "./RebalanceActionList";
import RebalancingCharts from "./RebalancingCharts";
import RebalancingActions from "./RebalancingActions";
import { RebalanceAction } from "@/hooks/rebalancing/useRebalancing";

interface RebalancingStatusCardProps {
  portfolio: Portfolio;
  filteredActions: RebalanceAction[];
  isDetailsOpen: boolean;
  onToggleDetails: (open: boolean) => void;
  onExecute: () => void;
  isExecuting: boolean;
  currentAllocation: { name: string; value: number; color: string; target: number; }[];
  targetAllocation: { name: string; value: number; color: string; }[];
}

const RebalancingStatusCard = ({
  portfolio,
  filteredActions,
  isDetailsOpen,
  onToggleDetails,
  onExecute,
  isExecuting,
  currentAllocation,
  targetAllocation
}: RebalancingStatusCardProps) => {
  return (
    <Card className="gradient-card mb-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Status do Rebalanceamento</CardTitle>
          <CardDescription>
            {portfolio.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.value || 0)}
          </CardDescription>
        </div>
        
        <RebalancingActions 
          onExecute={onExecute} 
          hasChanges={filteredActions.some(action => action.diffPercentage !== 0)}
          isExecuting={isExecuting}
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h3 className="font-medium mb-4">Resumo do Desbalanceamento</h3>
            <RebalanceActionList actions={filteredActions} />
          </div>
          
          <div className="lg:w-1/2 flex flex-col sm:flex-row gap-4">
            <RebalancingCharts 
              currentAllocation={currentAllocation}
              targetAllocation={targetAllocation}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Collapsible 
          open={isDetailsOpen} 
          onOpenChange={onToggleDetails}
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
                  {filteredActions.map((action, index) => (
                    action.diffPercentage !== 0 && (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3">{action.assetClass}</td>
                        <td className={`py-3 ${action.color}`}>{action.action}</td>
                        <td className={`py-3 text-right ${action.color}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(action.amount)}
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Button onClick={onExecute} disabled={isExecuting}>
                  {isExecuting ? "Processando..." : "Executar Rebalanceamento"}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
};

export default RebalancingStatusCard;
