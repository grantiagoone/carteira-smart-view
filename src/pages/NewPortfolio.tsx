
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";
import { AssetList } from "@/components/assets/AssetList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da carteira deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

const NewPortfolio = () => {
  const { toast: useToastFn } = useToast();
  const navigate = useNavigate();
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleAddAsset = (asset: Asset) => {
    // If asset already exists, remove it
    if (selectedAssets.some(a => a.ticker === asset.ticker)) {
      setSelectedAssets(selectedAssets.filter(a => a.ticker !== asset.ticker));
      
      // Remove quantity data
      const newQuantities = { ...assetQuantities };
      delete newQuantities[asset.id];
      setAssetQuantities(newQuantities);
      
      toast(`${asset.ticker} removido da carteira`);
      return;
    }
    
    // Add the asset
    setSelectedAssets([...selectedAssets, asset]);
    toast(`${asset.ticker} adicionado à carteira`);
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(asset => asset.id !== assetId));
    
    // Remove quantity data
    const newQuantities = { ...assetQuantities };
    delete newQuantities[assetId];
    setAssetQuantities(newQuantities);
  };

  const handleUpdateQuantity = (assetId: string, quantity: number) => {
    setAssetQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
  };

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
    // Calculate total portfolio value
    const totalValue = Object.entries(assetQuantities).reduce((total, [assetId, quantity]) => {
      const asset = selectedAssets.find(a => a.id === assetId);
      return total + (asset ? asset.price * quantity : 0);
    }, 0);

    // Calculate allocation data based on selected assets
    const assetsByType: Record<string, number> = {};
    
    selectedAssets.forEach(asset => {
      const quantity = assetQuantities[asset.id] || 0;
      const assetValue = asset.price * quantity;
      
      if (assetValue > 0) {
        assetsByType[asset.type] = (assetsByType[asset.type] || 0) + assetValue;
      }
    });
    
    const allocationData = Object.entries(assetsByType).map(([type, value]) => {
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      
      const colorMap: Record<string, string> = {
        "stock": "#ea384c",
        "reit": "#0D9488",
        "fixed_income": "#F59E0B",
        "international": "#222"
      };
      
      const nameMap: Record<string, string> = {
        "stock": "Ações",
        "reit": "FIIs",
        "fixed_income": "Renda Fixa",
        "international": "Internacional"
      };
      
      return {
        name: nameMap[type] || type,
        value: Math.round(percentage),
        color: colorMap[type] || "#6B7280"
      };
    });
    
    // If no assets with quantities, use default allocation
    const finalAllocation = allocationData.length > 0 ? allocationData : [
      { name: 'Ações', value: 40, color: '#ea384c' },
      { name: 'FIIs', value: 20, color: '#0D9488' },
      { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
      { name: 'Internacional', value: 10, color: '#222' }
    ];

    // Process assets into a storable format
    const portfolioAssets = selectedAssets.map(asset => ({
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      price: asset.price,
      type: asset.type,
      quantity: assetQuantities[asset.id] || 0
    }));
    
    // Carregar carteiras existentes ou inicializar com array vazio
    const existingPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    
    // Criar nova carteira com ID único e dados
    const newPortfolio = {
      id: Date.now(), // Usar timestamp como ID único
      name: values.name,
      description: values.description || "",
      value: totalValue,
      returnPercentage: 0,
      returnValue: 0,
      allocationData: finalAllocation,
      assets: portfolioAssets
    };
    
    // Adicionar nova carteira e salvar no localStorage
    const updatedPortfolios = [...existingPortfolios, newPortfolio];
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    console.log("Nova carteira criada:", newPortfolio);
    
    useToastFn({
      title: "Carteira criada com sucesso!",
      description: `A carteira ${values.name} foi criada.`,
    });

    // Navegar para a página de carteiras
    navigate("/portfolios");
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
                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep}>
                      Próximo: Adicionar Ativos
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          Buscar e Adicionar Ativos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Adicionar Ativos</DialogTitle>
                          <DialogDescription>
                            Busque por ticker ou nome do ativo para adicionar à sua carteira
                          </DialogDescription>
                        </DialogHeader>
                        <AssetSearch 
                          onAddAsset={handleAddAsset} 
                          selectedAssets={selectedAssets} 
                        />
                      </DialogContent>
                    </Dialog>

                    <AssetList 
                      assets={selectedAssets} 
                      onRemoveAsset={handleRemoveAsset} 
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={previousStep}>
                      Voltar
                    </Button>
                    <Button type="submit">
                      Finalizar e Criar Carteira
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NewPortfolio;
