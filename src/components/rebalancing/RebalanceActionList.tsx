
import { RebalanceAction } from "@/hooks/rebalancing/useRebalancing";

interface RebalanceActionListProps {
  actions: RebalanceAction[];
}

const RebalanceActionList = ({ actions }: RebalanceActionListProps) => {
  return (
    <div className="space-y-6">
      {actions.map((action, index) => (
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
  );
};

export default RebalanceActionList;
