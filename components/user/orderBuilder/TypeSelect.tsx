import React from "react";
import { Circle, CheckCircle2 } from "lucide-react";

interface TypeSelectProps {
  selectedItem: string;
  onChange: (type: string) => void;
  items: string[];
  disabled?: boolean;
}

export default function TypeSelect({
  selectedItem,
  onChange,
  items,
  disabled = false,
}: TypeSelectProps) {
  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
        Type
      </div>
      <div className="p-4 flex flex-wrap gap-4">
        {items.map((item) => {
          const isSelected = selectedItem === item;
          return (
            <button
              key={item}
              onClick={() => !disabled && onChange(item)}
              disabled={disabled}
              className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all ${
                isSelected
                  ? "border-dark-blue bg-dark-blue/5 text-dark-blue"
                  : "border-light-gray-3 hover:border-dark-blue"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isSelected ? (
                <CheckCircle2 className="text-dark-blue" size={20} />
              ) : (
                <Circle className="text-gray-400" size={20} />
              )}
              <span className="font-semibold">{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

