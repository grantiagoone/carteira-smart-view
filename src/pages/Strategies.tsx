
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllocationChart from "@/components/charts/AllocationChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const Strategies = () => {
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
                <Button>Salvar Estratégia</Button>
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
                <Button className="w-full">Aplicar Modelo</Button>
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
                <Button className="w-full">Aplicar Modelo</Button>
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
                <Button className="w-full">Aplicar Modelo</Button>
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Atualização de Estratégia</p>
                    <p className="text-sm text-muted-foreground">15/04/2025</p>
                  </div>
                  <Button variant="outline" size="sm">Visualizar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Estratégia Inicial</p>
                    <p className="text-sm text-muted-foreground">01/04/2025</p>
                  </div>
                  <Button variant="outline" size="sm">Visualizar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Strategies;
