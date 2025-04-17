
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  Printer, 
  BarChart2,
  ArrowDownToLine
} from "lucide-react";
import { toast } from "sonner";

interface RebalancingActionsProps {
  onExecute: () => void;
  hasChanges: boolean;
}

const RebalancingActions = ({ onExecute, hasChanges }: RebalancingActionsProps) => {
  const handleExportPDF = () => {
    toast.info("Exportando relatório em PDF...");
    // Implementação real de exportação seria adicionada aqui
    setTimeout(() => {
      toast.success("Relatório exportado com sucesso!");
    }, 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link da análise copiado para a área de transferência!");
  };

  const handlePrint = () => {
    toast.info("Preparando para impressão...");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleViewDetails = () => {
    toast.info("Abrindo detalhamento da análise...");
    // Aqui seria implementada a navegação para uma página de detalhes
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-1"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Compartilhar</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handlePrint}
        className="flex items-center gap-1"
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Imprimir</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleViewDetails}
        className="flex items-center gap-1"
      >
        <BarChart2 className="h-4 w-4" />
        <span className="hidden sm:inline">Detalhes</span>
      </Button>
      
      <Button 
        variant="default" 
        size="sm"
        onClick={onExecute}
        disabled={!hasChanges}
        className="flex items-center gap-1"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Executar Rebalanceamento
      </Button>
    </div>
  );
};

export default React.memo(RebalancingActions);
