
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartPie, Wallet, DollarSign, Target } from "lucide-react";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            Bem-vindo ao Carteira Smart View
          </DialogTitle>
          <DialogDescription className="text-center">
            A plataforma completa para gerenciar suas carteiras de investimentos
            e otimizar sua estratégia de alocação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center text-center">
            <Wallet className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Crie Carteiras</h3>
            <p className="text-sm text-muted-foreground">Organize seus investimentos em múltiplas carteiras</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center text-center">
            <ChartPie className="h-8 w-8 text-secondary mb-2" />
            <h3 className="font-medium">Defina Estratégias</h3>
            <p className="text-sm text-muted-foreground">Configure sua alocação ideal por classe de ativos</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center text-center">
            <DollarSign className="h-8 w-8 text-accent mb-2" />
            <h3 className="font-medium">Aporte Inteligente</h3>
            <p className="text-sm text-muted-foreground">Receba sugestões para seus novos aportes</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center text-center">
            <Target className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Rebalanceamento</h3>
            <p className="text-sm text-muted-foreground">Mantenha sua carteira alinhada com sua estratégia</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Começar Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
