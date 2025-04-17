import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioBasicInfo from "@/components/portfolios/PortfolioBasicInfo";
import PortfolioAssets from "@/components/portfolios/PortfolioAssets";
import PortfolioAllocation from "@/components/portfolios/PortfolioAllocation";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/portfolios/ColorPicker";

const formSchema = z.object({
  name: z.string().min(2, "Nome da carteira deve ter pelo menos 2 caracteres"),
  value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Valor deve ser um número positivo",
  }),
  returnPercentage: z.string().refine((val) => !isNaN(Number(val)), {
    message: "O retorno deve ser um número válido",
  }),
});

const PortfolioEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    portfolio,
    loading,
    allocationItems,
    selectedAssets,
    assetQuantities,
    assetRatings,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating,
    deletePortfolio,
    deleteAllocationItem
  } = usePortfolio(id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "0",
      returnPercentage: "0",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!portfolio) return;
    
    const totalAllocation = allocationItems.reduce((sum, item) => sum + item.value, 0);
    if (totalAllocation !== 100) {
      toast("A alocação total deve ser 100%");
      return;
    }
    
    try {
      const { data: { session } } = supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast("Você precisa estar logado para salvar alterações");
        return;
      }
      
      const storageKey = `portfolios_${userId}`;
      const savedPortfolios = localStorage.getItem(storageKey);
      
      if (savedPortfolios) {
        const portfolios = JSON.parse(savedPortfolios);
        const portfolioIndex = portfolios.findIndex((p: any) => p.id === Number(id));
        
        if (portfolioIndex !== -1) {
          let totalValue = Number(values.value);
          
          const updatedAssets = selectedAssets.map(asset => ({
            ...asset,
            quantity: assetQuantities[asset.id] || 0
          }));
          
          if (updatedAssets.some(a => a.quantity > 0)) {
            totalValue = updatedAssets.reduce((sum, asset) => {
              return sum + (asset.price * (assetQuantities[asset.id] || 0));
            }, 0);
          }
          
          portfolios[portfolioIndex] = {
            ...portfolios[portfolioIndex],
            name: values.name,
            value: totalValue,
            returnPercentage: Number(values.returnPercentage),
            returnValue: (totalValue * Number(values.returnPercentage)) / 100,
            allocationData: allocationItems,
            assets: updatedAssets,
            assetRatings: assetRatings
          };
          
          localStorage.setItem(storageKey, JSON.stringify(portfolios));
          
          toast("Carteira atualizada com sucesso");
          
          navigate(`/portfolio/${id}`);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast("Erro ao atualizar carteira");
    }
  };

  const handleDeleteAllocation = (allocationName: string) => {
    if (allocationItems.length <= 1) {
      toast.error("Não é possível excluir a última alocação");
      return;
    }
    
    deleteAllocationItem(allocationName);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-medium mb-2">Carteira não encontrada</h2>
          <Button asChild>
            <Link to="/portfolios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Carteiras
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link to={`/portfolio/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Editar Carteira</h1>
          </div>
          <p className="text-muted-foreground">Modifique os detalhes da sua carteira</p>
        </div>
        <DeletePortfolioDialog onDelete={deletePortfolio} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <PortfolioBasicInfo />
            
            <PortfolioAssets 
              selectedAssets={selectedAssets} 
              onAddAsset={handleAddAsset}
              onRemoveAsset={handleRemoveAsset}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateRating={handleUpdateRating}
              assetRatings={assetRatings}
            />
            
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
                              <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleDeleteAllocation(item.name)}
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
                      Total: <span className={`font-bold ${allocationItems.reduce((sum, item) => sum + item.value, 0) !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                        {allocationItems.reduce((sum, item) => sum + item.value, 0)}%
                      </span>
                      {allocationItems.reduce((sum, item) => sum + item.value, 0) !== 100 && (
                        <p className="text-xs text-red-500">O total deve ser 100%</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link to={`/portfolio/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioEdit;
