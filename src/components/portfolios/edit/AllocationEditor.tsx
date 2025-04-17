
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { AllocationItem } from "@/hooks/portfolio/types";
import { ColorPicker } from "@/components/portfolios/ColorPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface AllocationEditorProps {
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, item: AllocationItem) => void;
  addAllocationItem: (item: AllocationItem) => void;
  deleteAllocationItem: (name: string) => void;
}

const AllocationEditor = ({
  allocationItems,
  updateAllocationItem,
  addAllocationItem,
  deleteAllocationItem
}: AllocationEditorProps) => {
  const [totalAllocation, setTotalAllocation] = useState(0);

  useEffect(() => {
    // Calculate total allocation whenever items change
    const total = allocationItems.reduce((sum, item) => sum + item.value, 0);
    setTotalAllocation(total);
  }, [allocationItems]);

  const handleDeleteAllocation = (allocationName: string) => {
    if (allocationItems.length <= 1) {
      toast.error("Não é possível excluir a última alocação");
      return;
    }
    
    deleteAllocationItem(allocationName);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Alocação da Carteira</CardTitle>
        <CardDescription>
          Defina como seus investimentos devem ser distribuídos entre as diferentes classes de ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allocationItems.map((item, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 gap-4 items-center border p-3 rounded-md relative"
              style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
            >
              <div className="col-span-5 sm:col-span-5">
                <Input 
                  placeholder="Nome da alocação" 
                  value={item.name}
                  onChange={(e) => updateAllocationItem(index, { ...item, name: e.target.value })}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="col-span-5 sm:col-span-5">
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[item.value]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => {
                      updateAllocationItem(index, { ...item, value: values[0] });
                    }}
                  />
                  <Input 
                    type="number"
                    min={0}
                    max={100}
                    value={item.value}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateAllocationItem(index, { ...item, value: Math.min(100, Math.max(0, value)) });
                    }}
                    className="w-16 text-right"
                  />
                  <span className="ml-1">%</span>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-1 flex justify-center">
                <ColorPicker 
                  color={item.color} 
                  onChange={(color) => updateAllocationItem(index, { ...item, color })}
                />
              </div>
              <div className="col-span-1 sm:col-span-1 flex justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash size={16} />
                      <span className="sr-only">Excluir alocação</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Excluir alocação</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja excluir a alocação "{item.name}"?
                        Esta ação não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          handleDeleteAllocation(item.name);
                        }}
                      >
                        Excluir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => addAllocationItem({
                name: "Nova Alocação",
                value: 0,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
              })}
            >
              Adicionar Alocação
            </Button>
            
            <div className="text-sm">
              Total: <span className={`font-bold ${totalAllocation !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                {totalAllocation}%
              </span>
              {totalAllocation !== 100 && (
                <p className="text-xs text-red-500">O total deve ser 100%</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationEditor;
