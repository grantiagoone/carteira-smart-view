
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { Portfolio } from "@/hooks/portfolio/types";
import { RebalancingSuggestion } from "@/hooks/portfolio/types";

interface PortfolioAssetsTableProps {
  portfolio: Portfolio;
  rebalancingSuggestions: RebalancingSuggestion[];
}

const PortfolioAssetsTable = ({ portfolio, rebalancingSuggestions }: PortfolioAssetsTableProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        {portfolio.assets && portfolio.assets.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-xs uppercase">
                    <th className="px-4 py-2 text-left">Ticker</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-right">Preço Atual</th>
                    <th className="px-4 py-2 text-right">Qtd.</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">Alocação</th>
                    <th className="px-4 py-2 text-right">Alvo</th>
                    <th className="px-4 py-2 text-right">Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {portfolio.assets.map((asset) => {
                    const suggestion = rebalancingSuggestions.find(s => s.asset.id === asset.id);
                    return (
                      <tr key={asset.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 text-left font-medium">{asset.ticker}</td>
                        <td className="px-4 py-3 text-left">{asset.name}</td>
                        <td className="px-4 py-3 text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(asset.price))}
                        </td>
                        <td className="px-4 py-3 text-right">{asset.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(asset.price) * asset.quantity)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {suggestion ? `${suggestion.currentAllocation.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {suggestion ? `${suggestion.targetAllocation.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {suggestion && (
                            <span className={suggestion.action === 'buy' ? 'text-green-600' : 'text-red-600'}>
                              {suggestion.action === 'buy' ? '+' : '-'}{suggestion.quantityToAdjust}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Esta carteira não possui ativos cadastrados.</p>
        )}
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
  );
};

export default PortfolioAssetsTable;
