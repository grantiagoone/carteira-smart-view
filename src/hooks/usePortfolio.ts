
import { usePortfolioData } from "./portfolio/usePortfolioData";
import { Portfolio, AllocationItem } from "./portfolio/types";
import { Asset } from "@/services/brapiService";

export { type Asset } from "@/services/brapiService";
export type { Portfolio, AllocationItem } from "./portfolio/types";

export const usePortfolio = (portfolioId: string | undefined) => {
  const portfolioData = usePortfolioData(portfolioId);
  return portfolioData;
};
