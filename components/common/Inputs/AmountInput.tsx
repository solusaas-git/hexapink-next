"use client";

import { NumericFormat } from "react-number-format";
import { FiPlus, FiMinus } from "react-icons/fi";

import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { IoMdRadioButtonOn } from "react-icons/io";

interface InputProps {
  label: string;
  amount: number;
  amountType: string;
  setAmount: (value: number) => void;
  setAmountType: (value: string) => void;
}

export default function AmountInput({
  label,
  amountType,
  amount,
  setAmount,
  setAmountType,
}: InputProps) {
  const { currency } = useCurrencyContext();

  const handleIncreaseAmount = () => {
    setAmount((amount || 0) + 1);
  };

  const handleDecreaseAmount = () => {
    if ((amount || 0) > 0) {
      setAmount((amount || 0) - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start">
      <label
        htmlFor="currency-input"
        className="text-sm text-light-dark font-medium"
      >
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2"
          onClick={() => setAmountType("insert")}
        >
          <IoMdRadioButtonOn
            className={`flex items-center gap-1 cursor-pointer text-xl ${
              amountType === "insert" ? "text-dark-blue" : "text-light-gray-3"
            }`}
          />
          <span
            className={`flex items-center gap-1 cursor-pointer ${
              amountType === "insert" ? "text-dark-blue" : ""
            }`}
          >
            Insert
          </span>
        </div>
        <div
          onClick={() => setAmountType("pick")}
          className="flex items-center gap-2"
        >
          <IoMdRadioButtonOn
            className={`flex items-center gap-1 cursor-pointer text-xl ${
              amountType === "pick" ? "text-dark-blue" : "text-light-gray-3"
            }`}
          />
          <span
            className={`flex items-center gap-1 cursor-pointer ${
              amountType === "pick" ? "text-dark-blue" : ""
            }`}
          >
            Pick
          </span>
        </div>
      </div>
      <div
        id="currency-input"
        className="flex items-center justify-between p-0.5 border border-light-gray-3 rounded-lg"
      >
        <NumericFormat
          value={amount}
          thousandSeparator=","
          decimalScale={0} // Allow decimals if needed
          fixedDecimalScale={true} // Ensure two decimal places
          allowNegative={false} // Prevent negative values
          onValueChange={(amount) => {
            const { floatValue } = amount; // Get the float value directly
            setAmount(floatValue || 0); // Update the value
          }}
          className="w-full p-1.5 bg-transparent border-none outline-none text-dark-blue font-bold"
        />
        <div className="flex items-center gap-1">
          <span className="bg-light-gray-1 px-2 box-content rounded-md text-sm">
            {currency}
          </span>
          <div className="flex items-center border border-light-gray-3 rounded-md divide-x divide-light-gray-3 text-dark">
            <div
              onClick={handleDecreaseAmount}
              className="p-0 border-none outline-none"
            >
              <FiMinus className="p-2 box-content text-dark cursor-pointer border-r border-light-gray-3" />
            </div>
            <div
              onClick={handleIncreaseAmount}
              className="p-0 border-none outline-none"
            >
              <FiPlus className="p-2 box-content text-dark cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
