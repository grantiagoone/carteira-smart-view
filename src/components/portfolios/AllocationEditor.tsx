
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AllocationItem } from "@/hooks/portfolio/types";

interface AllocationEditorProps {
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, field: keyof AllocationItem, value: string | number) => void;
  removeAllocationItem: (index: number) => void;
  addAllocationItem: () => void;
}

const AllocationEditor = ({
  allocationItems,
  updateAllocationItem,
  removeAllocationItem,
  addAllocationItem
}: AllocationEditorProps) => {
  const [totalAllocation, setTotalAllocation] = useState(100);
  
  useEffect(() => {
    const total = allocationItems.reduce((sum, item) => sum + item.value, 0);
    setTotalAllocation(total);
  }, [allocationItems]);
  
  return (
    <div className="space-y-6">
      {totalAllocation !== 100 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A alocação total deve ser 100%. Atualmente: {totalAllocation}%
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {allocationItems.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-md"
            style={{ borderLeft: `4px solid ${item.color}` }}
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <FormLabel className="text-xs">Nome</FormLabel>
                <Input 
                  value={item.name} 
                  onChange={(e) => updateAllocationItem(index, "name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <FormLabel className="text-xs">Alocação (%)</FormLabel>
                <Input 
                  type="number" 
                  value={item.value} 
                  onChange={(e) => updateAllocationItem(index, "value", e.target.value)}
                  min="0" 
                  max="100"
                  className="mt-1"
                />
              </div>
              <div>
                <FormLabel className="text-xs">Cor</FormLabel>
                <div className="flex items-center mt-1 gap-2">
                  <Input 
                    type="color" 
                    value={item.color} 
                    onChange={(e) => updateAllocationItem(index, "color", e.target.value)}
                    className="w-12 h-8 p-0 cursor-pointer"
                  />
                  <Input 
                    type="text" 
                    value={item.color} 
                    onChange={(e) => updateAllocationItem(index, "color", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => removeAllocationItem(index)}
              className="min-w-[40px]"
            >
              <AlertCircle className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button type="button" onClick={addAllocationItem}>
        Adicionar Classe de Ativo
      </Button>
      
      {allocationItems.length > 0 && (
        <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded-md">
          <span className="font-medium">Total:</span>
          <span className={totalAllocation !== 100 ? "text-destructive font-bold" : "font-bold"}>
            {totalAllocation}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AllocationEditor;
