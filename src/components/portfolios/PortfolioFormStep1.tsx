
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import AllocationEditor from "./AllocationEditor";
import { AllocationItem } from "@/hooks/portfolio/types";

interface PortfolioFormStep1Props {
  form: UseFormReturn<any>;
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, field: keyof AllocationItem, value: string | number) => void;
  removeAllocationItem: (index: number) => void;
  addAllocationItem: () => void;
  totalAllocation: number;
  onNextStep: () => void;
}

const PortfolioFormStep1 = ({
  form,
  allocationItems,
  updateAllocationItem,
  removeAllocationItem,
  addAllocationItem,
  totalAllocation,
  onNextStep
}: PortfolioFormStep1Props) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Carteira</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Carteira Principal" {...field} />
            </FormControl>
            <FormDescription>
              Este será o nome exibido para identificar sua carteira.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Carteira de longo prazo para aposentadoria" {...field} />
            </FormControl>
            <FormDescription>
              Uma breve descrição sobre o objetivo desta carteira.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Macro Alocação</h3>
        <AllocationEditor 
          allocationItems={allocationItems}
          updateAllocationItem={updateAllocationItem}
          removeAllocationItem={removeAllocationItem}
          addAllocationItem={addAllocationItem}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNextStep}
          disabled={totalAllocation !== 100}
        >
          Próximo: Adicionar Ativos
        </Button>
      </div>
    </>
  );
};

export default PortfolioFormStep1;
