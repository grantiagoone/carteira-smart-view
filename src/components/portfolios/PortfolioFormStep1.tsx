
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import AllocationEditor from "./AllocationEditor";
import AllocationTemplates from "./AllocationTemplates";
import { AllocationItem } from "@/hooks/portfolio/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PortfolioFormStep1Props {
  form: UseFormReturn<any>;
  allocationItems: AllocationItem[];
  updateAllocationItem: (index: number, field: keyof AllocationItem, value: string | number) => void;
  removeAllocationItem: (index: number) => void;
  addAllocationItem: () => void;
  setAllocationItems: (items: AllocationItem[]) => void;
  totalAllocation: number;
  onNextStep: () => void;
}

const PortfolioFormStep1 = ({
  form,
  allocationItems,
  updateAllocationItem,
  removeAllocationItem,
  addAllocationItem,
  setAllocationItems,
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
      
      <Tabs defaultValue="custom" className="mt-8">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="custom">Alocação Personalizada</TabsTrigger>
          <TabsTrigger value="templates">Modelos Prontos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom">
          <h3 className="text-lg font-medium mb-4">Macro Alocação</h3>
          <AllocationEditor 
            allocationItems={allocationItems}
            updateAllocationItem={updateAllocationItem}
            removeAllocationItem={removeAllocationItem}
            addAllocationItem={addAllocationItem}
          />
        </TabsContent>
        
        <TabsContent value="templates">
          <AllocationTemplates onApplyTemplate={setAllocationItems} />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
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
