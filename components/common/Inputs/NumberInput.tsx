"use client";

import { NumericFormat } from "react-number-format";
import { FiPlus, FiMinus } from "react-icons/fi";

import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface InputProps {
  label: string;
  value: number | undefined;
  disabled?: boolean;
  isCurrency?: boolean;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  error?: string;
}

export default function NumberInput({
  label,
  value,
  disabled,
  isCurrency,
  min,
  max,
  onChange,
  error,
}: InputProps) {
  const { currency } = useCurrencyContext();

  const handleIncreaseInput = () => {
    if (max && (value || 0) >= max) return; // Prevent exceeding max value
    onChange((value || 0) + 1);
  };

  const handleDecreaseInput = () => {
    if (min && (value || 0) <= min) return; // Prevent going below min value
    onChange((value || 0) - 1);
  };

  return (
    <div className="w-full flex flex-col items-start">
      <label htmlFor={label} className="text-sm text-light-dark font-medium">
        {label}
      </label>
      <div className="w-full flex items-center justify-between p-0.5 border border-light-gray-3 rounded-lg">
        <NumericFormat
          id={label}
          value={value}
          thousandSeparator=","
          decimalScale={isCurrency ? 4 : 0} // Allow four decimal places if currency
          fixedDecimalScale={true} // Ensure fixed decimal places
          allowNegative={false} // Prevent negative values
          isAllowed={(values) => {
            const { floatValue } = values;
            return (floatValue ?? 0) <= (max ?? Infinity); 
          }}
          disabled={disabled}
          onValueChange={(values) => {
            const { floatValue } = values; // Get the float value directly
            onChange(floatValue || 0); // Update the value
          }}
          className="max-w-32 p-1.5 bg-transparent border-none outline-none text-dark-blue font-bold"
        />
        <div className="flex items-center gap-1">
          {isCurrency && (
            <span className="bg-light-gray-1 px-2 box-content rounded-md text-sm">
              {currency}
            </span>
          )}
          <div className="flex items-center gap-1 border border-light-gray-3 rounded-md divide-x divide-light-gray-3 text-dark">
            <button
              disabled={disabled}
              onClick={handleDecreaseInput}
              className="p-0 border-none bg-transparent"
            >
              <FiMinus className="p-2 box-content text-dark cursor-pointer" />
            </button>
            <button
              disabled={disabled}
              onClick={handleIncreaseInput}
              className="p-0 border-none bg-transparent"
            >
              <FiPlus className="p-2 box-content text-dark cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
      <span>{error}</span>
    </div>
  );
}
