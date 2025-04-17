
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X, Save } from "lucide-react";
import { Link } from "react-router-dom";

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

interface PortfolioAllocationProps {
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, field: keyof AllocationItem, value: string | number) => void;
  removeAllocationItem: (index: number) => void;
  addAllocationItem: () => void;
  portfolioId: string;
}

const PortfolioAllocation = ({
  allocationItems,
  updateAllocationItem,
  removeAllocationItem,
  addAllocationItem,
  portfolioId
}: PortfolioAllocationProps) => {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alocação</CardTitle>
        <Button type="button" variant="outline" onClick={addAllocationItem}>
          Adicionar Classe de Ativo
        </Button>
      </CardHeader>
      <CardContent>
        {allocationItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Nenhuma alocação definida</p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addAllocationItem}
              className="mt-2"
            >
              Adicionar Classe de Ativo
            </Button>
          </div>
        ) : (
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
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link to={`/portfolio/${portfolioId}`}>Cancelar</Link>
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PortfolioAllocation;
