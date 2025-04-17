
import React, { useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterControlsProps {
  onFilterChange: (filters: any) => void;
}

const FilterControls = ({ onFilterChange }: FilterControlsProps) => {
  const [threshold, setThreshold] = useState([5]);
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);
  const [sortBy, setSortBy] = useState("difference");
  
  const handleApplyFilters = useCallback(() => {
    onFilterChange({
      threshold: threshold[0],
      showOnlyChanges,
      sortBy
    });
  }, [threshold, showOnlyChanges, sortBy, onFilterChange]);
  
  const handleThresholdChange = useCallback((value: number[]) => {
    setThreshold(value);
  }, []);
  
  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);
  
  const handleShowOnlyChangesChange = useCallback((checked: boolean) => {
    setShowOnlyChanges(checked);
  }, []);
  
  return (
    <div className="bg-card shadow-sm rounded-lg border p-4 mb-4">
      <h3 className="font-medium mb-3">Filtros de Rebalanceamento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="threshold">Diferença mínima: {threshold[0]}%</Label>
          <Slider
            id="threshold"
            defaultValue={[5]}
            max={20}
            step={1}
            onValueChange={handleThresholdChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sort-by">Ordenar por</Label>
          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Ordenação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difference">Maior diferença</SelectItem>
              <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
              <SelectItem value="current">Alocação atual</SelectItem>
              <SelectItem value="target">Alocação alvo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="changes-only" 
              checked={showOnlyChanges}
              onCheckedChange={handleShowOnlyChangesChange}
            />
            <Label htmlFor="changes-only">Apenas desbalanceados</Label>
          </div>
          
          <Button onClick={handleApplyFilters} size="sm">
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Only rerender when the onFilterChange function reference changes
function areEqual(prevProps: FilterControlsProps, nextProps: FilterControlsProps) {
  return prevProps.onFilterChange === nextProps.onFilterChange;
}

export default React.memo(FilterControls, areEqual);
