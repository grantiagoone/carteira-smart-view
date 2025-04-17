
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PortfolioActionsProps {
  portfolioId: string;
}

const PortfolioActions = ({ portfolioId }: PortfolioActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        asChild
      >
        <Link to={`/portfolio/${portfolioId}`}>Cancelar</Link>
      </Button>
      <Button type="submit">Salvar Alterações</Button>
    </div>
  );
};

export default PortfolioActions;
