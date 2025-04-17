import React, { useState, useEffect, useMemo } from "react";
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
  deleteAllocationItem: (index: number) => Promise<boolean> | void;
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
    const total = allocationItems.reduce((sum, item) => sum + item.value, 0);
    setTotalAllocation(total);
    setShowWarning(total !== 100);
  }, [allocationItems]);

  const allocationWarning = useMemo(() => {
    if (showWarning) {
      return (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A alocação total deve ser 100%. Atualmente: {totalAllocation}%
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }, [showWarning, totalAllocation]);

  const emptyStateUI = useMemo(() => (
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
  ), [addAllocationItem]);

  const allocationTotal = useMemo(() => (
    <div className="mt-2 flex justify-between items-center py-2 px-4 bg-muted/50 rounded-md">
      <span className="font-medium">Total:</span>
      <span className={totalAllocation !== 100 ? "text-destructive font-bold" : "font-bold"}>
        {totalAllocation}%
      </span>
    </div>
  ), [totalAllocation]);

  const handleDeleteAllocationItem = (index: number) => {
    if (typeof deleteAllocationItem === 'function') {
      if (allocationItems[index]) {
        const itemName = allocationItems[index].name;
        if (deleteAllocationItem.length === 1) {
          return deleteAllocationItem(itemName);
        } else {
          return deleteAllocationItem(index);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Macro Alocação</h3>
        <Button type="button" onClick={addAllocationItem} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Classe de Ativo
        </Button>
      </div>

      {allocationWarning}

      {allocationItems.length === 0 ? (
        emptyStateUI
      ) : (
        <div className="grid gap-4">
          {allocationItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-md"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FormLabel className="text-xs">Nome</FormLabel>
                  <select
                    value={item.name}
                    onChange={(e) => updateAllocationItem(index, "name", e.target.value)}
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2"
                  >
                    <option value="stock">Ações</option>
                    <option value="reit">FIIs</option>
                    <option value="fixed_income">Renda Fixa</option>
                    <option value="international">Internacional</option>
                  </select>
                </div>
                <div>
                  <FormLabel className="text-xs">Alocação (%)</FormLabel>
                  <Input 
                    type="number" 
                    value={item.value}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 0;
                      updateAllocationItem(index, "value", newValue);
                    }}
                    min="0" 
                    max="100"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteAllocationItem(index)}
                className="min-w-[40px] h-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}

          {allocationItems.length > 0 && allocationTotal}
        </div>
      )}
    </div>
  );
};

export default React.memo(AllocationEditor);
