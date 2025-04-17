
import { Asset } from "@/services/brapiService";

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface Portfolio {
  id: number;
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
