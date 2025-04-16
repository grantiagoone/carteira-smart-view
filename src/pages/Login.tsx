
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setIsLoading(false);
    if (error) {
      toast.error('Email ou senha inválidos');
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setIsResetting(false);
    if (error) {
      toast.error('Erro ao enviar email de recuperação');
      console.error(error);
    } else {
      toast.success('Email de recuperação enviado com sucesso!');
      setResetPasswordOpen(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      toast.error('Erro no login com Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3B58] to-[#123047]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Bem-vindo</h2>
          <p className="text-gray-300">
            Faça login para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
          />
          <Input 
            type="password" 
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
          />
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              className="p-0 h-auto text-sm text-[#4CC38A] hover:text-[#5CD99A]"
              onClick={() => setResetPasswordOpen(true)}
            >
              Esqueceu sua senha?
            </Button>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[#4CC38A] hover:bg-[#5CD99A] text-white" 
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A3B58] px-2 text-gray-400">
                Ou continue com
              </span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-white/30 text-white hover:bg-white/20"
            onClick={handleGoogleLogin}
          >
            <Mail className="mr-2 h-4 w-4" />
            Entrar com Google
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-white/30 text-white hover:bg-white/20"
            onClick={() => navigate('/register')}
          >
            Criar conta
          </Button>
        </form>
      </div>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="bg-[#1A3B58] text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Recuperação de senha</DialogTitle>
            <DialogDescription className="text-gray-300">
              Digite seu email para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <Input 
                type="email" 
                placeholder="Email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={() => setResetPasswordOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isResetting}
                className="bg-[#4CC38A] hover:bg-[#5CD99A]"
              >
                {isResetting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
