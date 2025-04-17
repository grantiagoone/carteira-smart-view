
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AssetSearch, Asset } from "@/components/assets/AssetSearch";
import { AssetList } from "@/components/assets/AssetList";

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

interface Portfolio {
  id: number;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: AllocationItem[];
  assets?: Asset[];
}

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
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "0",
      returnPercentage: "0",
    },
  });

  useEffect(() => {
    const fetchPortfolio = () => {
      setLoading(true);
      try {
        const savedPortfolios = localStorage.getItem('portfolios');
        if (savedPortfolios) {
          const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
          const foundPortfolio = portfolios.find(p => p.id === Number(id));
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
            setAllocationItems([...foundPortfolio.allocationData]);
            
            // Initialize selected assets and quantities if they exist
            if (foundPortfolio.assets) {
              setSelectedAssets([...foundPortfolio.assets]);
              
              // Create quantities object from assets
              const quantities: Record<string, number> = {};
              foundPortfolio.assets.forEach(asset => {
                quantities[asset.id] = asset.quantity || 0;
              });
              setAssetQuantities(quantities);
            }
            
            // Populate form with portfolio data
            form.reset({
              name: foundPortfolio.name,
              value: foundPortfolio.value.toString(),
              returnPercentage: foundPortfolio.returnPercentage.toString(),
            });
          } else {
            toast("Carteira não encontrada");
            navigate("/portfolios");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar carteira:", error);
        toast("Erro ao carregar carteira");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id, navigate, form]);

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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!portfolio) return;
    
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
        const portfolioIndex = portfolios.findIndex(p => p.id === Number(id));
        
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
          
          let updatedAllocation = [...allocationItems];
          
          // If we have assets with values, generate allocation data from them
          if (Object.values(assetsByType).some(v => v > 0)) {
            updatedAllocation = Object.entries(assetsByType).map(([type, value]) => {
              const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
              
              // Find existing allocation item with the same name or create new one
              const existingItem = allocationItems.find(item => {
                const typeNameMap: Record<string, string> = {
                  "stock": "Ações",
                  "reit": "FIIs",
                  "fixed_income": "Renda Fixa",
                  "international": "Internacional"
                };
                return item.name === (typeNameMap[type] || type);
              });
              
              if (existingItem) {
                return {
                  ...existingItem,
                  value: Math.round(percentage)
                };
              }
              
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
          }

          // Update the portfolio
          portfolios[portfolioIndex] = {
            ...portfolios[portfolioIndex],
            name: values.name,
            value: totalValue,
            returnPercentage: Number(values.returnPercentage),
            returnValue: (totalValue * Number(values.returnPercentage)) / 100,
            allocationData: updatedAllocation,
            assets: updatedAssets
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

  const deletePortfolio = () => {
    try {
      const savedPortfolios = localStorage.getItem('portfolios');
      if (savedPortfolios) {
        const portfolios: Portfolio[] = JSON.parse(savedPortfolios);
        const updatedPortfolios = portfolios.filter(p => p.id !== Number(id));
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
        
        toast("Carteira excluída com sucesso");
        
        navigate("/portfolios");
      }
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
      toast("Erro ao excluir carteira");
    }
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 sm:mt-0">
              <Trash className="mr-2 h-4 w-4" />
              Excluir Carteira
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a carteira
                e todos os seus dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deletePortfolio} className="bg-destructive text-destructive-foreground">
                Sim, excluir carteira
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Carteira</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da Carteira" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retorno (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ativos</CardTitle>
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
              </CardHeader>
              <CardContent>
                <AssetList 
                  assets={selectedAssets} 
                  onRemoveAsset={handleRemoveAsset} 
                  onUpdateQuantity={handleUpdateQuantity}
                />
              </CardContent>
            </Card>

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
                  <Link to={`/portfolio/${id}`}>Cancelar</Link>
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioEdit;
