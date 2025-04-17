
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Portfolio } from "@/hooks/portfolio/types";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary = ({ portfolio }: PortfolioSummaryProps) => {
  return (
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
  );
};

export default PortfolioSummary;
