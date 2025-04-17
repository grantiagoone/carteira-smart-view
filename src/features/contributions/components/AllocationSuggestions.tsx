
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SuggestionCard } from "./SuggestionCard";
import { AssetSuggestion } from "../hooks/useContributionCalculation";

type AllocationSuggestionsProps = {
  amount: string;
  portfolioName: string;
  suggestions: AssetSuggestion[];
  onBack: () => void;
  onConfirm: () => void;
};

export const AllocationSuggestions = ({
  amount,
  portfolioName,
  suggestions,
  onBack,
  onConfirm,
}: AllocationSuggestionsProps) => {
  return (
    <Card className="gradient-card max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Sugestão de Alocação Inteligente</CardTitle>
        <CardDescription>
          Com base na sua estratégia atual e nas diferenças entre alocação atual e desejada, 
          sugerimos a seguinte alocação para o seu aporte de{' '}
          {parseFloat(amount.replace(',', '.')).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}{' '}
          na {portfolioName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suggestions.map((item, index) => (
            <SuggestionCard key={index} suggestion={item} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar e Ajustar
        </Button>
        <Button onClick={onConfirm}>
          Confirmar Alocação
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AllocationSuggestions;
