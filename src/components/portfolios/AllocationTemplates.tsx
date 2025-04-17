
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllocationChart from "@/components/charts/AllocationChart";
import { AllocationItem } from "@/hooks/portfolio/types";

interface AllocationTemplatesProps {
  onApplyTemplate: (template: AllocationItem[]) => void;
}

const AllocationTemplates = ({ onApplyTemplate }: AllocationTemplatesProps) => {
  const conservativeTemplate: AllocationItem[] = [
    { name: 'Ações', value: 20, color: '#1E40AF' },
    { name: 'FIIs', value: 15, color: '#0D9488' },
    { name: 'Renda Fixa', value: 60, color: '#F59E0B' },
    { name: 'Internacional', value: 5, color: '#6B7280' }
  ];

  const moderateTemplate: AllocationItem[] = [
    { name: 'Ações', value: 40, color: '#1E40AF' },
    { name: 'FIIs', value: 20, color: '#0D9488' },
    { name: 'Renda Fixa', value: 30, color: '#F59E0B' },
    { name: 'Internacional', value: 10, color: '#6B7280' }
  ];

  const aggressiveTemplate: AllocationItem[] = [
    { name: 'Ações', value: 60, color: '#1E40AF' },
    { name: 'FIIs', value: 15, color: '#0D9488' },
    { name: 'Renda Fixa', value: 10, color: '#F59E0B' },
    { name: 'Internacional', value: 15, color: '#6B7280' }
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Modelos de Alocação</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Conservador</CardTitle>
            <CardDescription>
              Foco em estabilidade e preservação do capital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationChart data={conservativeTemplate} />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onApplyTemplate(conservativeTemplate)}
            >
              Aplicar Modelo
            </Button>
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
            <AllocationChart data={moderateTemplate} />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onApplyTemplate(moderateTemplate)}
            >
              Aplicar Modelo
            </Button>
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
            <AllocationChart data={aggressiveTemplate} />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onApplyTemplate(aggressiveTemplate)}
            >
              Aplicar Modelo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AllocationTemplates;
