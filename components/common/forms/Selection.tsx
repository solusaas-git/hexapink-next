import { IoMdRadioButtonOn } from "react-icons/io";

interface SelectionProps {
  label: string;
  items: string[];
  selectedItem: string;
  disabled?: boolean;
  onChange: (item: string) => void;
}

export default function Selection({
  label,
  items,
  selectedItem,
  disabled = false,
  onChange,
}: SelectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-dark text-left text-sm">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border border-light-gray-3 cursor-pointer ${
              selectedItem === item ? "text-dark-blue border-dark-blue bg-light-blue" : "text-dark"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

