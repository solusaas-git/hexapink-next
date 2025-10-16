"use client";

import { IoMdRadioButtonOn } from "react-icons/io";

interface SelectionProps {
  label: string;
  items: string[];
  selectedItem: string;
  disabled: boolean;
  onChange: (item: string) => void;
}

export default function Selection({
  label,
  items,
  selectedItem,
  disabled,
  onChange,
}: SelectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-dark text-left text-sm">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            className={`flex items-center gap-2 px-2 py-1 rounded-full border border-light-gray-3 cursor-pointer ${
              selectedItem === item ? "text-dark-blue" : "text-dark"
            }`}
            disabled={disabled}
            onClick={() => onChange(item)}
          >
            <IoMdRadioButtonOn
              className={`text-xl ${
                selectedItem === item ? "text-dark-blue" : "text-light-gray-3"
              }`}
            />
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
