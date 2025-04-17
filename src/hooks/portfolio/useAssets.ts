
import { useState } from "react";
import { Asset } from "@/services/brapiService";
import { toast } from "sonner";
import { distributeAllocationByType } from "./portfolioUtils";
import { AllocationItem, AssetQuantities, AssetRatings } from "./types";

export const useAssets = (
  initialAssets: Asset[] = [], 
  initialQuantities: AssetQuantities = {},
  initialRatings: AssetRatings = {},
  allocationItems: AllocationItem[] = []
) => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>(initialAssets);
  const [assetQuantities, setAssetQuantities] = useState<AssetQuantities>(initialQuantities);
  const [assetRatings, setAssetRatings] = useState<AssetRatings>(initialRatings);

  const handleAddAsset = (asset: Asset) => {
    // If asset already exists, remove it
    if (selectedAssets.some(a => a.ticker === asset.ticker)) {
      setSelectedAssets(selectedAssets.filter(a => a.ticker !== asset.ticker));
      
      // Remove quantity data
      const newQuantities = { ...assetQuantities };
      delete newQuantities[asset.id];
      setAssetQuantities(newQuantities);
      
      // Remove rating data
      const newRatings = { ...assetRatings };
      delete newRatings[asset.id];
      setAssetRatings(newRatings);
      
      toast(`${asset.ticker} removido da carteira`);
      return;
    }
    
    // Add the asset
    setSelectedAssets([...selectedAssets, asset]);
    
    // Initialize with default rating of 5
    setAssetRatings(prev => ({
      ...prev,
      [asset.id]: 5
    }));
    
    // Distribute percentages among assets of the same type
    distributeAllocationByType(
      [...selectedAssets, asset],
      allocationItems,
      { ...assetRatings, [asset.id]: 5 },
      handleUpdateQuantity
    );
    
    toast(`${asset.ticker} adicionado à carteira`);
  };

  const handleRemoveAsset = (assetId: string) => {
    const assetToRemove = selectedAssets.find(asset => asset.id === assetId);
    if (!assetToRemove) return;
    
    setSelectedAssets(selectedAssets.filter(asset => asset.id !== assetId));
    
    // Remove quantity data
    const newQuantities = { ...assetQuantities };
    delete newQuantities[assetId];
    setAssetQuantities(newQuantities);
    
    // Remove rating data
    const newRatings = { ...assetRatings };
    delete newRatings[assetId];
    setAssetRatings(newRatings);
    
    // Redistribute percentages among remaining assets
    distributeAllocationByType(
      selectedAssets.filter(asset => asset.id !== assetId),
      allocationItems,
      newRatings,
      handleUpdateQuantity
    );
  };

  const handleUpdateQuantity = (assetId: string, quantity: number) => {
    setAssetQuantities(prev => ({
      ...prev,
      [assetId]: quantity
    }));
  };
  
  const handleUpdateRating = (assetId: string, rating: number) => {
    setAssetRatings(prev => ({
      ...prev,
      [assetId]: rating
    }));
  };

  return {
    selectedAssets,
    setSelectedAssets,
    assetQuantities,
    setAssetQuantities,
    assetRatings,
    setAssetRatings,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateQuantity,
    handleUpdateRating
  };
};
