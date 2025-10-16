"use client";

import { NumericFormat } from "react-number-format";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useState } from "react";

import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { IoMdRadioButtonOn } from "react-icons/io";

interface OptionalNumberInputProps {
  label: string;
  value: number | undefined;
  disabled: boolean;
  isCurrency: boolean;
  option: string;
  options: string[];
  changeValue: (option: string, value: number) => void;
  changeOption: (option: string) => void;
  filteredDataCount: number;
  unitPrice: number; // Add unitPrice prop
  error: string;
}

export default function OptionalNumberInput({
  label,
  value,
  disabled,
  isCurrency,
  option,
  options,
  unitPrice, // Destructure new props
  filteredDataCount,
  error,
  changeValue,
  changeOption,
}: OptionalNumberInputProps) {
  const { currency } = useCurrencyContext();
  const [localError, setLocalError] = useState<string>(""); // Local error state

  const handleIncreaseInput = () => {
    setLocalError(""); // Clear error on manual increment
    changeValue(option, (value || 0) + 1);
  };

  const handleDecreaseInput = () => {
    setLocalError(""); // Clear error on manual decrement
    if ((value || 0) > 0) {
      changeValue(option, (value || 0) - 1);
    }
  };

  const handleValueChange = (newValue: number) => {
    setLocalError(""); // Clear error before validation
    changeValue(option, newValue); // Update the value only if validation passes
  };

  const isValueAllowed = (values: { floatValue?: number }) => {
    const { floatValue } = values;
    if (floatValue === undefined) {
      setLocalError(""); // Allow empty input
      return true;
    }
    if (option === "Volumn" && floatValue > filteredDataCount) {
      setLocalError(
        `The value cannot exceed the volume of ${filteredDataCount}.`
      );
      return false; // Prevent exceeding volume
    }
    if (option === "Price" && floatValue > filteredDataCount * unitPrice) {
      setLocalError(
        `The value cannot exceed the total price of ${
          filteredDataCount * unitPrice
        } ${currency}.`
      );
      return false; // Prevent exceeding volume * unitPrice
    }
    setLocalError(""); // Clear error if valid
    return true; // Allow valid values
  };

  return (
    <div className="flex flex-col items-start">
      <label
        htmlFor="currency-input"
        className="text-sm text-light-dark font-medium"
      >
        {label}
      </label>
      {/* Option select */}
      <div className="flex items-center gap-4 divide-x-2 divide-light-gray-3">
        {options.map((item) => (
          <button
            key={item}
            className={`flex items-center gap-2 px-0 py-2 border-none bg-transparent focus:border-none focus:outline-none cursor-pointer text-sm ${
              option === item ? "text-dark-blue" : "text-dark"
            }`}
            onClick={() => changeOption(item)}
          >
            <IoMdRadioButtonOn
              className={`text-xl ${
                option === item ? "text-dark-blue" : "text-light-gray-3"
              }`}
            />
            {item}
          </button>
        ))}
      </div>
      {/* Numebr input */}
      <div
        id="currency-input"
        className="w-full flex items-center justify-between p-0.5 border border-light-gray-3 rounded-lg"
      >
        <NumericFormat
          value={value}
          thousandSeparator=","
          decimalScale={option === "Price" ? 2 : 0} // Allow 2 decimal places for Price
          fixedDecimalScale={option === "Price"} // Ensure fixed decimal places for Price
          allowNegative={false} // Prevent negative values
          disabled={disabled}
          isAllowed={isValueAllowed} // Use validation logic
          onValueChange={(values) => {
            const { floatValue } = values; // Get the float value directly
            handleValueChange(floatValue || 0); // Update the value
          }}
          className="w-32 p-1.5 bg-transparent border-none outline-none text-dark-blue font-bold"
        />
        <div className="flex items-center gap-1">
          {isCurrency && option !== "Volumn" && (
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
      {/* Show error message */}
      <span className="text-red text-sm text-left">{localError || error}</span>
    </div>
  );
}
