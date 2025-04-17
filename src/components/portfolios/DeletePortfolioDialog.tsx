
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeletePortfolioDialogProps {
  onDelete: () => void;
}

const DeletePortfolioDialog = ({ onDelete }: DeletePortfolioDialogProps) => {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!password) {
      setError("Por favor, insira sua senha");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        throw new Error("Usuário não encontrado");
      }

      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        setError("Senha incorreta");
        setIsDeleting(false);
        return;
      }

      // If we got here, password is correct
      onDelete();
      toast.success("Carteira excluída com sucesso");
    } catch (err) {
      console.error("Erro ao verificar senha:", err);
      setError("Erro ao verificar senha");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
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
        
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-amber-100 p-2 rounded-full">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <Label htmlFor="password" className="text-sm font-medium">
            Digite sua senha para confirmar
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? "border-red-500" : ""}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }} 
            className="bg-destructive text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Sim, excluir carteira"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePortfolioDialog;
