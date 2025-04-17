
import { useParams, Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioBasicInfo from "@/components/portfolios/PortfolioBasicInfo";
import PortfolioAssets from "@/components/portfolios/PortfolioAssets";
import PortfolioAllocation from "@/components/portfolios/PortfolioAllocation";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";

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
    deletePortfolio
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
    
    // Validate that allocation adds up to 100%
    const totalAllocation = allocationItems.reduce((sum, item) => sum + item.value, 0);
    if (totalAllocation !== 100) {
      toast("A alocação total deve ser 100%");
      return;
    }
    
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios = JSON.parse(savedPortfolios);
        const portfolioIndex = portfolios.findIndex((p: any) => p.id === Number(id));
        
        if (portfolioIndex !== -1) {
          // Calculate total portfolio value from assets if any are present
          let totalValue = Number(values.value);
          
          // Process assets for saving, adding the quantity info
          const updatedAssets = selectedAssets.map(asset => ({
            ...asset,
            quantity: assetQuantities[asset.id] || 0
          }));
          
          // Calculate value from assets if there are any with quantities
          if (updatedAssets.some(a => a.quantity > 0)) {
            totalValue = updatedAssets.reduce((sum, asset) => {
              return sum + (asset.price * (assetQuantities[asset.id] || 0));
            }, 0);
          }
          
          // Calculate allocation data based on assets
          const assetsByType: Record<string, number> = {};
          
          updatedAssets.forEach(asset => {
            const quantity = assetQuantities[asset.id] || 0;
            const assetValue = asset.price * quantity;
            
            if (assetValue > 0) {
              assetsByType[asset.type] = (assetsByType[asset.type] || 0) + assetValue;
            }
          });
          
          // Update the portfolio
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
          
          localStorage.setItem('portfolios', JSON.stringify(portfolios));
          
          toast("Carteira atualizada com sucesso");
          
          navigate(`/portfolio/${id}`);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast("Erro ao atualizar carteira");
    }
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
            
            <PortfolioAllocation 
              allocationItems={allocationItems}
              updateAllocationItem={updateAllocationItem}
              removeAllocationItem={removeAllocationItem}
              addAllocationItem={addAllocationItem}
              portfolioId={id || ""}
            />
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioEdit;
