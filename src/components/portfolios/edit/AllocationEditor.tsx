
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { X, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AllocationItem } from "@/hooks/portfolio/types";

interface AllocationEditorProps {
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, field: keyof AllocationItem, value: string | number) => void;
  addAllocationItem: () => void;
  deleteAllocationItem: (name: string) => Promise<boolean>;
}

const AllocationEditor = ({
  allocationItems,
  updateAllocationItem,
  addAllocationItem,
  deleteAllocationItem
}: AllocationEditorProps) => {
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Calculate total allocation whenever items change
    const total = allocationItems.reduce((sum, item) => sum + item.value, 0);
    setTotalAllocation(total);
    setShowWarning(total !== 100);
  }, [allocationItems]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Macro Alocação</h3>
        <Button type="button" onClick={addAllocationItem} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Classe de Ativo
        </Button>
      </div>

      {showWarning && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A alocação total deve ser 100%. Atualmente: {totalAllocation}%
          </AlertDescription>
        </Alert>
      )}

      {allocationItems.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-md bg-muted/50">
          <p className="text-muted-foreground">Nenhuma alocação definida</p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addAllocationItem}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Classe de Ativo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
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
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      updateAllocationItem(index, "value", newValue);
                    }}
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
                size="sm"
                onClick={() => deleteAllocationItem(item.name)}
                className="min-w-[40px] h-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}

          <div className="mt-2 flex justify-between items-center py-2 px-4 bg-muted/50 rounded-md">
            <span className="font-medium">Total:</span>
            <span className={totalAllocation !== 100 ? "text-destructive font-bold" : "font-bold"}>
              {totalAllocation}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationEditor;
