
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Predefined colors
  const colors = [
    "#4299e1", // blue
    "#68d391", // green
    "#f6ad55", // orange
    "#f687b3", // pink
    "#a3bffa", // indigo
    "#d6bcfa", // purple
    "#fbd38d", // yellow
    "#fc8181", // red
    "#cbd5e0", // gray
    "#9ae6b4", // green-300
    "#63b3ed", // blue-300
    "#e53e3e", // red-600
    "#38a169", // green-600
    "#4c51bf", // indigo-600
    "#805ad5", // purple-600
    "#dd6b20", // orange-600
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-8 h-8 p-0 border-gray-300"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Mudar cor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption}
              className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ backgroundColor: colorOption }}
              onClick={() => {
                onChange(colorOption);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
