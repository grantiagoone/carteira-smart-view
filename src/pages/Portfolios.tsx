import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, ChevronDown, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AllocationChart from "@/components/charts/AllocationChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";
import { usePortfolioPriceUpdater } from "@/hooks/portfolio/usePortfolioPriceUpdater";
import DeletePortfolioDialog from "@/components/portfolios/DeletePortfolioDialog";
import { AlertTriangle } from "lucide-react";

interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: string;
  quantity: number;
}

interface Portfolio {
  id: number;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: {
    name: string;
    value: number;
    color: string;
  }[];
  assets?: Asset[];
}

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"single" | "all">("single");
  const [loading, setLoading] = useState(true);
  const { updateAllPortfoliosPrices, isUpdating } = usePortfolioPriceUpdater();
  
  useEffect(() => {
    const loadUserPortfolios = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const userPortfolios = getAllPortfoliosFromStorage(userId);
          setPortfolios(userPortfolios);
          
          if (userPortfolios.length > 0) {
            setSelectedPortfolioId(userPortfolios[0].id);
          }
        } else {
          setPortfolios([]);
        }
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
        toast("Erro ao carregar carteiras");
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserPortfolios();
  }, []);
  
  useEffect(() => {
    if (portfolios.length === 0) return;
    
    const interval = setInterval(() => {
      refreshAllPrices();
    }, 10800000); // 3 horas
    
    return () => clearInterval(interval);
  }, [portfolios]);

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolioId(Number(value));
  };

  const handleViewTypeChange = (value: "single" | "all") => {
    setViewType(value);
  };
  
  const refreshAllPrices = async () => {
    if (isUpdating || portfolios.length === 0) return;
    
    toast("Atualizando preços dos ativos...");
    const updated = await updateAllPortfoliosPrices();
    
    if (updated) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const userPortfolios = getAllPortfoliosFromStorage(userId);
          setPortfolios(userPortfolios);
          toast.success("Preços atualizados com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao atualizar carteiras:", error);
        toast.error("Erro ao atualizar preços");
      }
    } else {
      toast("Nenhum preço foi alterado");
    }
  };

  const getAssetsByType = (portfolio: Portfolio) => {
    if (!portfolio.assets || portfolio.assets.length === 0) return [];
    
    const assetsByType: Record<string, {total: number, items: Asset[]}> = {};
    
    portfolio.assets.forEach(asset => {
      const type = asset.type || 'other';
      if (!assetsByType[type]) {
        assetsByType[type] = { total: 0, items: [] };
      }
      
      const assetValue = asset.price * asset.quantity;
      assetsByType[type].total += assetValue;
      assetsByType[type].items.push(asset);
    });
    
    const typeNameMap: Record<string, string> = {
      'stock': 'Ações',
      'reit': 'FIIs',
      'fixed_income': 'Renda Fixa',
      'international': 'Internacional',
      'other': 'Outros'
    };
    
    return Object.entries(assetsByType).map(([type, data]) => ({
      name: typeNameMap[type] || type,
      total: data.total,
      items: data.items
    }));
  };

  const handleDeletePortfolio = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        toast.error("Usuário não autenticado");
        return false;
      }

      const updatedPortfolios = portfolios.filter(p => p.id !== selectedPortfolioId);
      setPortfolios(updatedPortfolios);
      
      if (updatedPortfolios.length > 0) {
        setSelectedPortfolioId(updatedPortfolios[0].id);
      } else {
        setSelectedPortfolioId(null);
      }
      
      setViewType("all");
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
      toast.error("Erro ao excluir carteira");
      return false;
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

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carteiras</h1>
          <p className="text-muted-foreground">Gerencie suas carteiras de investimentos</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={refreshAllPrices} disabled={isUpdating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Atualizando...' : 'Atualizar Preços'}
          </Button>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link to="/portfolio/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Link>
          </Button>
        </div>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mt-4 text-lg font-medium">Nenhuma carteira cadastrada</h2>
          <p className="mt-1 text-muted-foreground">Crie sua primeira carteira para começar</p>
          <Button className="mt-4 bg-primary hover:bg-primary/90" asChild>
            <Link to="/portfolio/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex gap-4 items-center">
              <RadioGroup 
                defaultValue="single" 
                value={viewType}
                onValueChange={(value) => handleViewTypeChange(value as "single" | "all")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <label htmlFor="single" className="cursor-pointer">Visão Individual</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <label htmlFor="all" className="cursor-pointer">Todas as Carteiras</label>
                </div>
              </RadioGroup>
            </div>

            {viewType === "single" && (
              <div className="w-full sm:w-64">
                <Select value={selectedPortfolioId?.toString()} onValueChange={handlePortfolioChange}>
                  <SelectTrigger className="w-full border-primary">
                    <SelectValue placeholder="Selecione uma carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {viewType === "single" ? (
            selectedPortfolio ? (
              <div className="space-y-6">
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span>{selectedPortfolio.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.value)}
                          </div>
                          <div className="text-sm text-green-600">
                            +{selectedPortfolio.returnPercentage}% 
                            <span className="text-muted-foreground ml-1">
                              ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.returnValue)})
                            </span>
                          </div>
                        </div>
                        {selectedPortfolio.value === 0 && (
                          <div className="flex items-center gap-2 bg-amber-100 p-2 rounded-md">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-600">Carteira vazia</span>
                          </div>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Alocação Atual</h3>
                        <AllocationChart data={selectedPortfolio.allocationData} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Detalhes da Carteira</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Valor Total</p>
                              <p className="font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.value)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Retorno</p>
                              <p className="font-medium text-green-600">
                                +{selectedPortfolio.returnPercentage}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Ganho</p>
                              <p className="font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPortfolio.returnValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Criada em</p>
                              <p className="font-medium">15/03/2025</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link to={`/portfolio/${selectedPortfolio.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/portfolio/${selectedPortfolio.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                    <DeletePortfolioDialog 
                      portfolioId={selectedPortfolioId} 
                      onDelete={handleDeletePortfolio} 
                    />
                  </CardFooter>
                </Card>

                {selectedPortfolio.assets && selectedPortfolio.assets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ativos na Carteira</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {getAssetsByType(selectedPortfolio).map((group, index) => (
                          <div key={index}>
                            <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                              <span>{group.name}</span>
                              <span className="text-base font-normal text-muted-foreground">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(group.total)}
                              </span>
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-muted/50 text-xs uppercase">
                                    <th className="px-4 py-2 text-left">Ticker</th>
                                    <th className="px-4 py-2 text-left">Nome</th>
                                    <th className="px-4 py-2 text-right">Preço</th>
                                    <th className="px-4 py-2 text-right">Qtd.</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {group.items.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-muted/20">
                                      <td className="px-4 py-3 text-left font-medium">{asset.ticker}</td>
                                      <td className="px-4 py-3 text-left">{asset.name}</td>
                                      <td className="px-4 py-3 text-right">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price)}
                                      </td>
                                      <td className="px-4 py-3 text-right">{asset.quantity}</td>
                                      <td className="px-4 py-3 text-right font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price * asset.quantity)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho da Carteira</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Aqui será exibido o gráfico de desempenho da carteira ao longo do tempo.</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p>Selecione uma carteira para visualizar seus detalhes</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="gradient-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span>{portfolio.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.value)}
                          </div>
                          <div className="text-sm text-green-600">
                            +{portfolio.returnPercentage}% 
                            <span className="text-muted-foreground ml-1">
                              ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.returnValue)})
                            </span>
                          </div>
                        </div>
                        {portfolio.value === 0 && (
                          <div className="flex items-center gap-2 bg-amber-100 p-2 rounded-md">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-600">Carteira vazia</span>
                          </div>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AllocationChart data={portfolio.allocationData} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link to={`/portfolio/${portfolio.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/portfolio/${portfolio.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                    <DeletePortfolioDialog 
                      portfolioId={portfolio.id} 
                      onDelete={() => handleDeletePortfolio()} 
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Portfolios;
