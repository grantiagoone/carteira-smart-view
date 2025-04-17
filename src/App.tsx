
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portfolios from "./pages/Portfolios";
import NewPortfolio from "./pages/NewPortfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import PortfolioEdit from "./pages/PortfolioEdit";
import Contributions from "./pages/Contributions";
import NewContribution from "./pages/NewContribution";
import Rebalance from "./pages/Rebalance";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { useBrapiToken } from "./hooks/useBrapiToken";

const queryClient = new QueryClient();

function App() {
  useBrapiToken();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/portfolios" element={<Portfolios />} />
            <Route path="/portfolio/new" element={<NewPortfolio />} />
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
            <Route path="/portfolio/:id/edit" element={<PortfolioEdit />} />
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
}

export default App;
