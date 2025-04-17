
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update session and user state
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setIsLoading(false);
        
        // When logging out
        if (event === 'SIGNED_OUT') {
          // Clear all user-specific data from localStorage
          if (session?.user?.id) {
            // Clear portfolios data
            localStorage.removeItem(`portfolios_${session.user.id}`);
            
            // Clear contributions data
            localStorage.removeItem(`contributions_${session.user.id}`);
            
            // Clear strategy history
            localStorage.removeItem(`strategyHistory_${session.user.id}`);
            
            // Clear other user-specific data
            localStorage.removeItem(`rebalancingHistory_${session.user.id}`);
          }
          
          // Only redirect if not already on login/register page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            navigate('/login');
          }
        }
        
        // If signed in and on auth pages, redirect to home
        if (event === 'SIGNED_IN') {
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            toast.success("Login realizado com sucesso!");
            navigate('/');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    try {
      // Get the current user ID before logout to clear their data
      const userId = user?.id;
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        toast.error('Erro ao fazer logout');
        return false;
      }
      
      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      
      // Clear ALL user-specific localStorage data
      if (userId) {
        // Clear portfolios data
        localStorage.removeItem(`portfolios_${userId}`);
        
        // Clear contributions data
        localStorage.removeItem(`contributions_${userId}`);
        
        // Clear strategy history
        localStorage.removeItem(`strategyHistory_${userId}`);
        
        // Clear other user-specific data
        localStorage.removeItem(`rebalancingHistory_${userId}`);
      }
      
      toast.success('Logout realizado com sucesso');
      navigate('/login');
      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Erro ao fazer logout');
      return false;
    }
  };

  return { isAuthenticated, user, session, logout, isLoading };
};
