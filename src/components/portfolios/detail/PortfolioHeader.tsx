
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, RefreshCw } from "lucide-react";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";
import { Portfolio } from "@/hooks/portfolio/types";

interface PortfolioHeaderProps {
  portfolio: Portfolio;
  isUpdating: boolean;
  onRefreshPrices: () => Promise<void>;
  onDelete: () => Promise<boolean>;
}

const PortfolioHeader = ({
  portfolio,
  isUpdating,
  onRefreshPrices,
  onDelete
}: PortfolioHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
            <Link to="/portfolios">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
        </div>
        <p className="text-muted-foreground">Detalhes e alocação da carteira</p>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button variant="outline" onClick={onRefreshPrices} disabled={isUpdating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Atualizando...' : 'Atualizar Preços'}
        </Button>
        <Button asChild>
          <Link to={`/portfolio/${String(portfolio.id)}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Carteira
          </Link>
        </Button>
        <DeletePortfolioDialog portfolioId={String(portfolio.id)} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default PortfolioHeader;
