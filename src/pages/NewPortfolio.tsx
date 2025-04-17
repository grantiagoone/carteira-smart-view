
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";
import { AssetList } from "@/components/assets/AssetList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da carteira deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
});

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

const defaultAllocation: AllocationItem[] = [
  { name: 'Ações', value: 40, color: '#ea384c' },
  { name: 'FIIs', value: 20, color: '#0D9488' },
  { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
  { name: 'Internacional', value: 10, color: '#222' }
];

const NewPortfolio = () => {
  const { toast: useToastFn } = useToast();
  const navigate = useNavigate();
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});
  const [assetRatings, setAssetRatings] = useState<Record<string, number>>({});
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>(defaultAllocation);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [totalAllocation, setTotalAllocation] = useState(100);

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

  const handleAddAsset = (asset: Asset) => {
    // If asset already exists, remove it
    if (selectedAssets.some(a => a.ticker === asset.ticker)) {
      setSelectedAssets(selectedAssets.filter(a => a.ticker !== asset.ticker));
      
      // Remove quantity data
      const newQuantities = { ...assetQuantities };
      delete newQuantities[asset.id];
      setAssetQuantities(newQuantities);
      
      // Remove rating data
      const newRatings = { ...assetRatings };
      delete newRatings[asset.id];
      setAssetRatings(newRatings);
      
      toast(`${asset.ticker} removido da carteira`);
      return;
    }
    
    // Add the asset
    setSelectedAssets([...selectedAssets, asset]);
    
    // Initialize with default rating of 5
    setAssetRatings(prev => ({
      ...prev,
      [asset.id]: 5
    }));
    
    // Distribute asset quantities based on allocation
    distributeAssetQuantitiesByType(asset);
    
    toast(`${asset.ticker} adicionado à carteira`);
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter(asset => asset.id !== assetId));
    
    // Remove quantity data
    const newQuantities = { ...assetQuantities };
    delete newQuantities[assetId];
    setAssetQuantities(newQuantities);
    
    // Remove rating data
    const newRatings = { ...assetRatings };
    delete newRatings[assetId];
    setAssetRatings(newRatings);
  };

  const handleUpdateQuantity = (assetId: string, quantity: number) => {
    setAssetQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
  };
  
  const handleUpdateRating = (assetId: string, rating: number) => {
    setAssetRatings(prev => ({
      ...prev,
      [assetId]: rating
    }));
    
    // After updating rating, redistribute based on new ratings
    redistributeAssetQuantities();
  };
  
  const updateAllocationItem = (index: number, field: keyof AllocationItem, value: string | number) => {
    const newItems = [...allocationItems];
    
    if (field === "value") {
      // Ensure value is a number
      newItems[index][field] = Number(value);
    } else {
      // For name and color, value will be a string
      newItems[index][field] = value as string;
    }
    
    setAllocationItems(newItems);
    
    // After updating allocation, redistribute quantities
    redistributeAssetQuantities();
  };

  const removeAllocationItem = (index: number) => {
    setAllocationItems(allocationItems.filter((_, i) => i !== index));
  };

  const addAllocationItem = () => {
    const newItem: AllocationItem = {
      name: "Nova Classe",
      value: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    };
    
    setAllocationItems([...allocationItems, newItem]);
  };
  
  const distributeAssetQuantitiesByType = (newAsset: Asset) => {
    // Find allocation item for the asset type
    const typeToAllocationMap: Record<string, string> = {
      "stock": "Ações",
      "reit": "FIIs",
      "fixed_income": "Renda Fixa",
      "international": "Internacional"
    };
    
    const assetType = newAsset.type;
    const allocationType = typeToAllocationMap[assetType] || assetType;
    const allocationItem = allocationItems.find(item => item.name === allocationType);
    
    if (allocationItem) {
      // Find all assets of the same type
      const assetsOfSameType = [...selectedAssets, newAsset].filter(a => a.type === assetType);
      
      if (assetsOfSameType.length > 0) {
        // Calculate total rating for weighted distribution
        const totalRating = assetsOfSameType.reduce(
          (sum, asset) => sum + (assetRatings[asset.id] || 5), 
          0
        );
        
        // If all assets have the same rating (or no ratings), distribute evenly
        if (totalRating === 0 || assetsOfSameType.every(a => 
          (assetRatings[a.id] || 5) === (assetRatings[assetsOfSameType[0].id] || 5))
        ) {
          const quantityPerAsset = 100 / assetsOfSameType.length;
          assetsOfSameType.forEach(asset => {
            handleUpdateQuantity(asset.id, quantityPerAsset);
          });
        } else {
          // Distribute based on ratings
          assetsOfSameType.forEach(asset => {
            const rating = assetRatings[asset.id] || 5;
            const weight = rating / totalRating;
            const quantity = weight * 100;
            handleUpdateQuantity(asset.id, quantity);
          });
        }
      }
    }
  };
  
  const redistributeAssetQuantities = () => {
    // Group assets by type
    const assetsByType: Record<string, Asset[]> = {};
    selectedAssets.forEach(asset => {
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = [];
      }
      assetsByType[asset.type].push(asset);
    });
    
    // Map asset types to allocation names
    const typeToAllocationMap: Record<string, string> = {
      "stock": "Ações",
      "reit": "FIIs",
      "fixed_income": "Renda Fixa",
      "international": "Internacional"
    };
    
    // For each asset type, distribute based on ratings
    Object.entries(assetsByType).forEach(([type, assets]) => {
      const allocationType = typeToAllocationMap[type] || type;
      const allocationItem = allocationItems.find(item => item.name === allocationType);
      
      if (allocationItem && assets.length > 0) {
        // Calculate total rating for weighted distribution
        const totalRating = assets.reduce((sum, asset) => sum + (assetRatings[asset.id] || 5), 0);
        
        // If all assets have the same rating (or no ratings), distribute evenly
        if (totalRating === 0 || assets.every(a => (assetRatings[a.id] || 5) === (assetRatings[assets[0].id] || 5))) {
          const quantityPerAsset = 100 / assets.length;
          assets.forEach(asset => {
            handleUpdateQuantity(asset.id, quantityPerAsset);
          });
        } else {
          // Distribute based on ratings
          assets.forEach(asset => {
            const rating = assetRatings[asset.id] || 5;
            const weight = rating / totalRating;
            const quantity = weight * 100;
            handleUpdateQuantity(asset.id, quantity);
          });
        }
      }
    });
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
    // Validate that allocation adds up to 100%
    if (totalAllocation !== 100) {
      toast("A alocação total deve ser 100%");
      return;
    }
    
    // Calculate total portfolio value
    const totalValue = Object.entries(assetQuantities).reduce((total, [assetId, quantity]) => {
      const asset = selectedAssets.find(a => a.id === assetId);
      return total + (asset ? asset.price * quantity : 0);
    }, 0);

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
      allocationData: allocationItems,
      assets: portfolioAssets,
      assetRatings: assetRatings
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

  // Render allocation editor
  const renderAllocationEditor = () => {
    return (
      <div className="space-y-6">
        {totalAllocation !== 100 && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A alocação total deve ser 100%. Atualmente: {totalAllocation}%
            </AlertDescription>
          </Alert>
        )}
        
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
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button type="button" onClick={addAllocationItem}>
          Adicionar Classe de Ativo
        </Button>
        
        {allocationItems.length > 0 && (
          <div className="flex justify-between items-center py-2 px-4 bg-muted/50 rounded-md">
            <span className="font-medium">Total:</span>
            <span className={totalAllocation !== 100 ? "text-destructive font-bold" : "font-bold"}>
              {totalAllocation}%
            </span>
          </div>
        )}
      </div>
    );
  };

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
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Macro Alocação</h3>
                    {renderAllocationEditor()}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={totalAllocation !== 100}
                    >
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
                      onUpdateRating={handleUpdateRating}
                      assetRatings={assetRatings}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={previousStep}>
                      Voltar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={totalAllocation !== 100}
                    >
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
