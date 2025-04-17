
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Portfolio } from "@/hooks/portfolio/types";
import { getAllPortfoliosFromStorage } from "@/hooks/portfolio/portfolioUtils";

interface RebalanceAction {
  assetClass: string;
  currentPercentage: number;
  targetPercentage: number;
  diffPercentage: number;
  action: string;
  amount: number;
  color: string;
}

interface RebalanceRecord {
  id: string;
  date: string;
  portfolioId: number;
  portfolio: string;
  changeCount: number;
  totalAmount: string;
  status: "completed" | "pending" | "failed";
  actions: RebalanceAction[];
}

interface RebalanceFilters {
  threshold: number;
  showOnlyChanges: boolean;
  sortBy: string;
}

export const useRebalancing = (portfolioId?: string) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<RebalanceRecord[]>([]);
  const [filteredActions, setFilteredActions] = useState<RebalanceAction[]>([]);
  const portfolioIdRef = useRef<string | undefined>(portfolioId);
  
  // Update the ref when portfolioId changes
  useEffect(() => {
    portfolioIdRef.current = portfolioId;
  }, [portfolioId]);
  
  // Carregar histórico do localStorage
  const loadHistory = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        const storageKey = `rebalance_history_${userId}`;
        const savedHistory = localStorage.getItem(storageKey);
        
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de rebalanceamento:", error);
    }
  }, []);
  
  // Salvar novo rebalanceamento
  const saveRebalancing = useCallback(async (
    portfolioId: string, 
    portfolioName: string, 
    actions: RebalanceAction[]
  ) => {
    try {
      setIsExecuting(true);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para salvar o rebalanceamento");
        return false;
      }
      
      const relevantActions = actions.filter(a => a.diffPercentage !== 0);
      
      const totalAmount = relevantActions.reduce((sum, action) => sum + action.amount, 0);
      
      const newRebalance: RebalanceRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR'),
        portfolioId: parseInt(portfolioId),
        portfolio: portfolioName,
        changeCount: relevantActions.length,
        totalAmount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount),
        status: "completed",
        actions: relevantActions
      };
      
      // Salvar no localStorage
      const storageKey = `rebalance_history_${userId}`;
      const savedHistory = localStorage.getItem(storageKey);
      let historyRecords = [];
      
      if (savedHistory) {
        historyRecords = JSON.parse(savedHistory);
      }
      
      historyRecords.unshift(newRebalance);
      localStorage.setItem(storageKey, JSON.stringify(historyRecords));
      
      // Atualizar estado
      setHistory(prevHistory => [newRebalance, ...prevHistory]);
      
      toast.success("Rebalanceamento executado com sucesso!", {
        description: `${relevantActions.length} alterações aplicadas no valor total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}`
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar rebalanceamento:", error);
      toast.error("Erro ao executar rebalanceamento");
      return false;
    } finally {
      setIsExecuting(false);
    }
  }, []);
  
  // Aplicar filtros às ações de rebalanceamento
  const applyFilters = useCallback((actions: RebalanceAction[], filters: RebalanceFilters) => {
    let filtered = [...actions];
    
    // Filtrar por threshold
    if (filters.threshold > 0) {
      filtered = filtered.filter(action => 
        Math.abs(action.diffPercentage) >= filters.threshold
      );
    }
    
    // Mostrar apenas ações com alterações
    if (filters.showOnlyChanges) {
      filtered = filtered.filter(action => action.diffPercentage !== 0);
    }
    
    // Ordenar
    switch (filters.sortBy) {
      case "difference":
        filtered.sort((a, b) => Math.abs(b.diffPercentage) - Math.abs(a.diffPercentage));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.assetClass.localeCompare(b.assetClass));
        break;
      case "current":
        filtered.sort((a, b) => b.currentPercentage - a.currentPercentage);
        break;
      case "target":
        filtered.sort((a, b) => b.targetPercentage - a.targetPercentage);
        break;
    }
    
    return filtered;
  }, []);
  
  const handleFilterChange = useCallback((actions: RebalanceAction[], filters: RebalanceFilters) => {
    if (!actions) return [];
    
    const filtered = applyFilters(actions, filters);
    setFilteredActions(filtered);
    return filtered;
  }, [applyFilters]);
  
  const viewRebalanceDetails = useCallback((id: string) => {
    const rebalance = history.find(item => item.id === id);
    if (rebalance) {
      toast.info(`Visualizando detalhes do rebalanceamento de ${rebalance.date}`);
      // Aqui seria implementada a navegação para uma página de detalhes
    }
  }, [history]);
  
  const repeatRebalance = useCallback((id: string) => {
    const rebalance = history.find(item => item.id === id);
    if (rebalance) {
      toast.info(`Repetindo rebalanceamento de ${rebalance.date}`);
      // Aqui seria implementada a lógica para repetir o rebalanceamento
    }
  }, [history]);

  // Clear filtered actions when portfolio changes
  useEffect(() => {
    return () => {
      // Clean up when portfolio changes or component unmounts
      setFilteredActions([]);
    };
  }, [portfolioId]);

  return {
    isExecuting,
    history,
    filteredActions,
    loadHistory,
    saveRebalancing,
    handleFilterChange,
    viewRebalanceDetails,
    repeatRebalance
  };
};
