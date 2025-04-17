
import { Json } from "@/integrations/supabase/types";

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  type: string;
  quantity: number;
}

export interface Portfolio {
  id: number | string;
  name: string;
  value: number;
  returnPercentage: number;
  returnValue: number;
  allocationData: AllocationItem[];
  assets?: Asset[];
  assetRatings: Record<string, number>;
}

export type AssetQuantities = Record<string, number>;
export type AssetRatings = Record<string, number>;

// Utility function to convert AllocationItem[] to Json for Supabase
export const allocationItemsToJson = (items: AllocationItem[]): Json => {
  return items as unknown as Json;
};

// Utility function to convert Json from Supabase to AllocationItem[]
export const jsonToAllocationItems = (json: Json): AllocationItem[] => {
  return json as unknown as AllocationItem[];
};

// Function to calculate portfolio value from assets
export const calculatePortfolioValue = (assets: Asset[] | undefined): number => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
};
