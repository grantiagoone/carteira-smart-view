
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portfolios from "./pages/Portfolios";
import NewPortfolio from "./pages/NewPortfolio";
import Strategies from "./pages/Strategies";
import Contributions from "./pages/Contributions";
import NewContribution from "./pages/NewContribution";
import Rebalance from "./pages/Rebalance";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/portfolio/new" element={<NewPortfolio />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/contribution/new" element={<NewContribution />} />
          <Route path="/rebalance" element={<Rebalance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
