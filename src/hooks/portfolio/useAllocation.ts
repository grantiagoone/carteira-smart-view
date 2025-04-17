
import { useState } from "react";
import { AllocationItem } from "./types";

export const useAllocation = (initialItems: AllocationItem[] = []) => {
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>(initialItems);
  
  const updateAllocationItem = (index: number, item: AllocationItem) => {
    const newItems = [...allocationItems];
    newItems[index] = item;
    setAllocationItems(newItems);
  };

  const removeAllocationItem = (index: number) => {
    setAllocationItems(allocationItems.filter((_, i) => i !== index));
  };

  const addAllocationItem = (item: AllocationItem) => {
    setAllocationItems([...allocationItems, item]);
  };
  
  return {
    allocationItems,
    setAllocationItems,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem
  };
};
