
import { AssetSuggestion } from "../hooks/useContributionCalculation";

type SuggestionCardProps = {
  suggestion: AssetSuggestion;
};

export const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  return (
    <div 
      className="bg-card p-4 rounded-md border shadow-sm"
      style={{ borderLeft: `4px solid ${suggestion.classColor || '#cbd5e0'}` }}
    >
      <div className="mb-1 text-sm font-medium text-muted-foreground">{suggestion.class}</div>
      <div className="text-lg font-bold text-foreground">{suggestion.ticker || suggestion.asset}</div>
      <div className="mt-2 flex justify-between">
        <span className="text-sm text-muted-foreground">{suggestion.percentage.toFixed(1)}%</span>
        <span className="font-medium text-primary">
          {suggestion.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
        </span>
      </div>
      {suggestion.quantity !== undefined && (
        <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Quantidade a comprar:</span>
          <span className="font-bold">{suggestion.quantity} cotas</span>
        </div>
      )}
      {(suggestion.currentPercentage !== undefined && suggestion.targetPercentage !== undefined) && (
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Atual:</span>
            <span>{suggestion.currentPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Após aporte:</span>
            <span>{suggestion.targetPercentage.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
