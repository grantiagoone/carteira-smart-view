
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Asset } from "@/components/assets/AssetSearch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage, savePortfoliosToStorage } from "@/hooks/portfolio/portfolioUtils";
import { useAllocation } from "@/hooks/portfolio/useAllocation";
import { useAssets } from "@/hooks/portfolio/useAssets";
import { AllocationItem } from "@/hooks/portfolio/types";
import PortfolioFormStep1 from "@/components/portfolios/PortfolioFormStep1";
import PortfolioFormStep2 from "@/components/portfolios/PortfolioFormStep2";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da carteira deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

const defaultAllocation: AllocationItem[] = [
  { name: 'Ações', value: 40, color: '#ea384c' },
  { name: 'FIIs', value: 20, color: '#0D9488' },
  { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
  { name: 'Internacional', value: 10, color: '#222' }
];

const NewPortfolio = () => {
  const { toast: useToastFn } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [totalAllocation, setTotalAllocation] = useState(100);

  // Initialize allocation hook
  const {
    allocationItems,
    setAllocationItems,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem
  } = useAllocation(defaultAllocation);

  // Initialize assets hook
  const {
    selectedAssets,
    assetQuantities,
    assetRatings,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating
  } = useAssets([], {}, {}, allocationItems);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  useEffect(() => {
    const total = allocationItems.reduce((sum, item) => sum + item.value, 0);
    setTotalAllocation(total);
  }, [allocationItems]);

  const nextStep = () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    setCurrentStep(2);
  };

  const previousStep = () => {
    setCurrentStep(1);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (totalAllocation !== 100) {
      toast("A alocação total deve ser 100%");
      return;
    }
    
    const totalValue = Object.entries(assetQuantities).reduce((total, [assetId, quantity]) => {
      const asset = selectedAssets.find(a => a.id === assetId);
      return total + (asset ? asset.price * quantity : 0);
    }, 0);

    const portfolioAssets = selectedAssets.map(asset => ({
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      price: asset.price,
      type: asset.type,
      quantity: assetQuantities[asset.id] || 0
    }));
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para criar uma carteira");
        return;
      }
      
      const existingPortfolios = getAllPortfoliosFromStorage(userId);
      
      const newPortfolio = {
        id: Date.now(),
        name: values.name,
        description: values.description || "",
        value: totalValue,
        returnPercentage: 0,
        returnValue: 0,
        allocationData: allocationItems,
        assets: portfolioAssets,
        assetRatings: assetRatings
      };
      
      const updatedPortfolios = [...existingPortfolios, newPortfolio];
      savePortfoliosToStorage(updatedPortfolios, userId);
      
      console.log("Nova carteira criada:", newPortfolio);
      
      useToastFn({
        title: "Carteira criada com sucesso!",
        description: `A carteira ${values.name} foi criada.`,
      });

      navigate("/portfolios");
    });
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/portfolios" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para Carteiras
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Nova Carteira</h1>
        <p className="text-muted-foreground">Crie uma nova carteira de investimentos</p>
      </div>

      <Card className="gradient-card max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 ? "Informações da Carteira" : "Adicionar Ativos"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "Defina as informações básicas da sua nova carteira de investimentos."
              : "Busque e adicione ativos à sua carteira"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 ? (
                <PortfolioFormStep1
                  form={form}
                  allocationItems={allocationItems}
                  updateAllocationItem={updateAllocationItem}
                  removeAllocationItem={removeAllocationItem}
                  addAllocationItem={addAllocationItem}
                  totalAllocation={totalAllocation}
                  onNextStep={nextStep}
                />
              ) : (
                <PortfolioFormStep2
                  selectedAssets={selectedAssets}
                  onAddAsset={handleAddAsset}
                  onRemoveAsset={handleRemoveAsset}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdateRating={handleUpdateRating}
                  assetRatings={assetRatings}
                  onPreviousStep={previousStep}
                />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NewPortfolio;
