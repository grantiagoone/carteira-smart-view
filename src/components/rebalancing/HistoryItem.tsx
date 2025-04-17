
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ArrowRight, Eye, RotateCw } from "lucide-react";

interface RebalanceHistoryItem {
  id: string;
  date: string;
  portfolio: string;
  changeCount: number;
  totalAmount: string;
  status: "completed" | "pending" | "failed";
}

interface HistoryItemProps {
  item: RebalanceHistoryItem;
  onView: (id: string) => void;
  onRepeat: (id: string) => void;
}

const HistoryItem = ({ item, onView, onRepeat }: HistoryItemProps) => {
  const statusColors = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700"
  };
  
  const statusText = {
    completed: "Concluído",
    pending: "Em processamento",
    failed: "Falhou"
  };
  
  return (
    <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <CalendarClock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{item.portfolio}</h3>
          <p className="text-sm text-muted-foreground">{item.date}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">{item.changeCount} alterações</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{item.totalAmount}</span>
      </div>
      
      <div className="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2 ml-0 sm:ml-auto">
        <span className={`px-2 py-1 rounded-md text-xs ${statusColors[item.status]}`}>
          {statusText[item.status]}
        </span>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onView(item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onRepeat(item.id)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(HistoryItem);
