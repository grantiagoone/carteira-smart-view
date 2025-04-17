
import { useState } from "react";
import { AllocationItem } from "./types";

export const useAllocation = (initialItems: AllocationItem[] = []) => {
  const [allocationItems, setAllocationItems] = useState<AllocationItem[]>(initialItems);
  
  const updateAllocationItem = (index: number, field: keyof AllocationItem, value: string | number) => {
    const newItems = [...allocationItems];
    
    if (field === "value") {
      // Ensure value is a number
      newItems[index][field] = Number(value);
    } else {
      // For name and color, value will be a string
      newItems[index][field] = value as string;
    }
    
    setAllocationItems(newItems);
  };

  const removeAllocationItem = (index: number) => {
    setAllocationItems(allocationItems.filter((_, i) => i !== index));
  };

  const addAllocationItem = () => {
    const newItem: AllocationItem = {
      name: "Nova Classe",
      value: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    };
    
    setAllocationItems([...allocationItems, newItem]);
  };
  
  return {
    allocationItems,
    setAllocationItems,
    updateAllocationItem,
    removeAllocationItem,
    addAllocationItem
  };
};
