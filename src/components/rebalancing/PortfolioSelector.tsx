
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Portfolio } from "@/hooks/portfolio/types";

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  selectedPortfolioId: string | null;
  onPortfolioChange: (value: string) => void;
}

const PortfolioSelector = ({
  portfolios,
  selectedPortfolioId,
  onPortfolioChange
}: PortfolioSelectorProps) => {
  return (
    <div className="w-full sm:w-64">
      <label htmlFor="portfolio-select" className="block text-sm font-medium text-gray-700 mb-1">
        Selecione a Carteira
      </label>
      <Select value={selectedPortfolioId || ''} onValueChange={onPortfolioChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma carteira" />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((portfolio) => (
            <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
              {portfolio.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PortfolioSelector;
