
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllocationChart from "@/components/charts/AllocationChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Strategies = () => {
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState({
    stocks: 35,
    reits: 25,
    fixedIncome: 30,
    international: 10
  });

  const handleSliderChange = (name: keyof typeof allocation, value: number[]) => {
    // We only use the first value since our sliders only return one value
    const newValue = value[0];
    
    const newAllocation = {
      ...allocation,
      [name]: newValue
    };
    
    // Calculate the total of all allocations
    const total = Object.values(newAllocation).reduce((sum, value) => sum + value, 0);
    
    // Adjust values if total is not 100%
    if (total !== 100) {
      const adjustmentFactor = 100 / total;
      Object.keys(newAllocation).forEach((key) => {
        if (key !== name) {
          newAllocation[key as keyof typeof allocation] = Math.round(
            newAllocation[key as keyof typeof allocation] * adjustmentFactor
          );
        }
      });
      
      // Ensure total is exactly 100% by adjusting the last category
      const newTotal = Object.values(newAllocation).reduce((sum, value) => sum + value, 0);
      if (newTotal !== 100) {
        const diff = 100 - newTotal;
        const keys = Object.keys(newAllocation).filter(k => k !== name);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1] as keyof typeof allocation;
          newAllocation[lastKey] += diff;
        }
      }
    }
    
    setAllocation(newAllocation);
  };

  const chartData = [
    { name: 'Ações', value: allocation.stocks, color: '#1E40AF' },
    { name: 'FIIs', value: allocation.reits, color: '#0D9488' },
    { name: 'Renda Fixa', value: allocation.fixedIncome, color: '#F59E0B' },
    { name: 'Internacional', value: allocation.international, color: '#6B7280' }
  ];
  
  const handleSaveStrategy = async () => {
    try {
      // Get active portfolio from localStorage or create default if none exists
      const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
      const activePortfolio = portfolios.length > 0 ? portfolios[portfolios.length - 1] : null;
      
      if (!activePortfolio) {
        toast.error("Nenhuma carteira encontrada. Por favor, crie uma carteira primeiro.");
        navigate("/portfolio/new");
        return;
      }
      
      // Update the active portfolio with new allocation
      const updatedPortfolio = {
        ...activePortfolio,
        allocationData: chartData
      };
      
      // Update portfolios in localStorage
      const updatedPortfolios = portfolios.map((p: any) => 
        p.id === updatedPortfolio.id ? updatedPortfolio : p
      );
      localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
      
      // Save to strategy history
      const historyEntry = {
        date: new Date().toISOString(),
        allocation: chartData
      };
      
      const strategyHistory = JSON.parse(localStorage.getItem('strategyHistory') || '[]');
      strategyHistory.unshift(historyEntry); // Add to start of array
      localStorage.setItem('strategyHistory', JSON.stringify(strategyHistory));
      
      // Show success message
      toast.success("Estratégia salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
      toast.error("Erro ao salvar a estratégia. Por favor, tente novamente.");
    }
  };
  
  // Function to apply pre-made strategy templates
  const applyStrategyTemplate = (templateType: string) => {
    let newAllocation = { ...allocation };
    
    switch(templateType) {
      case 'conservative':
        newAllocation = {
          stocks: 20,
          reits: 15,
          fixedIncome: 60,
          international: 5
        };
        break;
      case 'moderate':
        newAllocation = {
          stocks: 40,
          reits: 20,
          fixedIncome: 30,
          international: 10
        };
        break;
      case 'aggressive':
        newAllocation = {
          stocks: 60,
          reits: 15,
          fixedIncome: 10,
          international: 15
        };
        break;
    }
    
    setAllocation(newAllocation);
    toast.info("Modelo de estratégia aplicado. Não esqueça de salvar!");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Estratégias de Alocação</h1>
        <p className="text-muted-foreground">Defina sua estratégia de alocação por classe de ativos</p>
      </div>

      <Tabs defaultValue="custom" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="custom">Personalizada</TabsTrigger>
          <TabsTrigger value="templates">Modelos Prontos</TabsTrigger>
          <TabsTrigger value="history">Histórico de Alterações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Defina sua Alocação</CardTitle>
                <CardDescription>
                  Ajuste os percentuais para cada classe de ativos (total: 100%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="stocks">Ações</Label>
                      <span className="text-sm font-medium">{allocation.stocks}%</span>
                    </div>
                    <Slider 
                      id="stocks"
                      min={0} 
                      max={100} 
                      step={1}
                      value={[allocation.stocks]} 
                      onValueChange={(value) => handleSliderChange("stocks", value)}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="reits">FIIs</Label>
                      <span className="text-sm font-medium">{allocation.reits}%</span>
                    </div>
                    <Slider 
                      id="reits"
                      min={0} 
                      max={100}
                      step={1}
                      value={[allocation.reits]} 
                      onValueChange={(value) => handleSliderChange("reits", value)}
                      className="[&_[role=slider]]:bg-secondary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="fixedIncome">Renda Fixa</Label>
                      <span className="text-sm font-medium">{allocation.fixedIncome}%</span>
                    </div>
                    <Slider 
                      id="fixedIncome"
                      min={0} 
                      max={100}
                      step={1}
                      value={[allocation.fixedIncome]} 
                      onValueChange={(value) => handleSliderChange("fixedIncome", value)}
                      className="[&_[role=slider]]:bg-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="international">Internacional</Label>
                      <span className="text-sm font-medium">{allocation.international}%</span>
                    </div>
                    <Slider 
                      id="international"
                      min={0} 
                      max={100}
                      step={1}
                      value={[allocation.international]} 
                      onValueChange={(value) => handleSliderChange("international", value)}
                      className="[&_[role=slider]]:bg-gray-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSaveStrategy}>Salvar Estratégia</Button>
              </CardFooter>
            </Card>
            
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Visualização da Estratégia</CardTitle>
                <CardDescription>
                  Sua alocação ideal por classe de ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart data={chartData} />
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground w-full">
                  Uma boa estratégia de alocação considera seu perfil de risco e seus objetivos financeiros.
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Conservador</CardTitle>
                <CardDescription>
                  Foco em estabilidade e preservação do capital
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={[
                    { name: 'Ações', value: 20, color: '#1E40AF' },
                    { name: 'FIIs', value: 15, color: '#0D9488' },
                    { name: 'Renda Fixa', value: 60, color: '#F59E0B' },
                    { name: 'Internacional', value: 5, color: '#6B7280' }
                  ]} 
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => applyStrategyTemplate('conservative')}>Aplicar Modelo</Button>
              </CardFooter>
            </Card>
            
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Moderado</CardTitle>
                <CardDescription>
                  Equilíbrio entre crescimento e segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={[
                    { name: 'Ações', value: 40, color: '#1E40AF' },
                    { name: 'FIIs', value: 20, color: '#0D9488' },
                    { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
                    { name: 'Internacional', value: 10, color: '#6B7280' }
                  ]} 
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => applyStrategyTemplate('moderate')}>Aplicar Modelo</Button>
              </CardFooter>
            </Card>
            
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Arrojado</CardTitle>
                <CardDescription>
                  Foco em crescimento e maior exposição a risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={[
                    { name: 'Ações', value: 60, color: '#1E40AF' },
                    { name: 'FIIs', value: 15, color: '#0D9488' },
                    { name: 'Renda Fixa', value: 10, color: '#F59E0B' },
                    { name: 'Internacional', value: 15, color: '#6B7280' }
                  ]} 
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => applyStrategyTemplate('aggressive')}>Aplicar Modelo</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>
                Acompanhe as mudanças em sua estratégia ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const strategyHistory = JSON.parse(localStorage.getItem('strategyHistory') || '[]');
                  if (strategyHistory.length === 0) {
                    return (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">Nenhum histórico de alteração encontrado.</p>
                      </div>
                    );
                  }
                  
                  return strategyHistory.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Atualização de Estratégia</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setAllocation({
                            stocks: entry.allocation.find((a: any) => a.name === 'Ações')?.value || 0,
                            reits: entry.allocation.find((a: any) => a.name === 'FIIs')?.value || 0,
                            fixedIncome: entry.allocation.find((a: any) => a.name === 'Renda Fixa')?.value || 0,
                            international: entry.allocation.find((a: any) => a.name === 'Internacional')?.value || 0,
                          });
                          toast.info("Estratégia carregada. Vá para a aba 'Personalizada' para visualizar.");
                        }}
                      >
                        Visualizar
                      </Button>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Strategies;
