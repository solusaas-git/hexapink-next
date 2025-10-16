"use client";

import React, { useState, useEffect } from "react";
import CreditCard from "@/components/common/forms/CreditCard";
import { CardDetails } from "@/types";

import { GoArrowRight, GoArrowLeft } from "react-icons/go";

interface CardFromProps {
  cardDetails: CardDetails;
  setCardDetails: (details: CardDetails) => void;
}

const CardForm = ({ cardDetails, setCardDetails }: CardFromProps) => {
  const [step, setStep] = useState<"front" | "back">("front");
  const [currentInput, setCurrentInput] = useState<number>(0);
  const [sliding, setSliding] = useState<boolean>(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [focusedField, setFocusedField] = useState<keyof CardDetails | null>(
    null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      // Only allow numbers and limit to 16 digits
      const formatted = value.replace(/\D/g, "").substring(0, 16);
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else if (name === "expiryDate") {
      // Only allow numbers and limit to 4 digits (MMYY)
      let formatted = value.replace(/\D/g, "").substring(0, 4);
      if (formatted.length > 2) {
        formatted = formatted.substring(0, 2) + "/" + formatted.substring(2, 4);
      }
      const [month, year] = formatted.split("/");
      if (parseInt(month) > 12 && month.length === 2) {
        return; // Don't update if month > 12
      }
      setCardDetails({ ...cardDetails, expiryMonth: month || "", expiryYear: year || "" });

      // Automatically focus on the next input field
      if (formatted.length === 5) {
        setCurrentInput(currentInput + 1);
      }
    } else if (name === "cvv") {
      // Only allow numbers and limit to 3-4 digits
      const formatted = value.replace(/\D/g, "").substring(0, 4);
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const validateCardNumber = (number: string) => {
    // Luhn Algorithm for card number validation
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateCurrentInput = () => {
    switch (currentInput) {
      case 0: // Card Number
        return cardDetails.cardNumber.length === 16 && validateCardNumber(cardDetails.cardNumber);
      case 1: // Card Holder
        return cardDetails.cardHolder.trim() !== "";
      case 2: // Expiry Date
        return (
          cardDetails.expiryMonth.length === 2 &&
          parseInt(cardDetails.expiryMonth) <= 12 &&
          cardDetails.expiryYear.length === 2
        );
      case 3: // CVV
        return cardDetails.cvv.length >= 3;
      default:
        return false;
    }
  };

  const handleNextClick = () => {
    if (!validateCurrentInput()) {
      alert("Please enter valid information");
      return;
    }

    if (currentInput < 2) {
      setDirection("left");
      setSliding(true);

      setTimeout(() => {
        setCurrentInput(currentInput + 1);
        setSliding(false);
      }, 300);
    } else if (currentInput === 2) {
      // Form is complete
      alert("Card details are valid and ready for processing!");
    }
  };

  const handleBackClick = () => {
    if (currentInput > 0) {
      if (currentInput === 3) {
        // Going back from CVV to front side
        setStep("front");
      }

      setDirection("right");
      setSliding(true);

      setTimeout(() => {
        setCurrentInput(currentInput - 1);
        setSliding(false);
      }, 300);
    }
  };

  // Set the focused field based on current input
  useEffect(() => {
    const fields: (keyof CardDetails)[] = [
      "cardNumber",
      "cardHolder",
      "expiryMonth",
      "cvv",
    ];
    setFocusedField(fields[currentInput]);
  }, [currentInput]);

  const renderInput = () => {
    const slideClass = sliding
      ? direction === "left"
        ? "animate-slide-left"
        : "animate-slide-right"
      : "";

    switch (currentInput) {
      case 0:
        return (
          <div className={`w-full ${slideClass}`}>
            <label
              htmlFor="cardNumber"
              className="block text-sm text-left font-medium text-gray-700 mb-1"
            >
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={cardDetails.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("cardNumber")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4040BF]"
              placeholder="1234 5678 9012 3456"
              autoFocus
            />
          </div>
        );
      case 1:
        return (
          <div className={`w-full ${slideClass}`}>
            <label
              htmlFor="cardHolder"
              className="block text-sm text-left font-medium text-gray-700 mb-1"
            >
              Card Holder Name
            </label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={cardDetails.cardHolder}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("cardHolder")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4040BF]"
              placeholder="John Doe"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className={`w-full ${slideClass}`}>
            <label
              htmlFor="expiryDate"
              className="block text-sm text-left font-medium text-gray-700 mb-1"
            >
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={`${cardDetails.expiryMonth}/${cardDetails.expiryYear}`}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("expiryMonth")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4040BF]"
              placeholder="MM/YY"
              autoFocus
            />
          </div>
        );
      case 3:
        return (
          <div className={`w-full ${slideClass}`}>
            <label
              htmlFor="cvv"
              className="block text-sm text-left font-medium text-gray-700 mb-1"
            >
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("cvv")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4040BF]"
              placeholder="123"
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <CreditCard
          cardDetails={cardDetails}
          isFlipped={step === "back"}
          focusedField={focusedField}
        />
      </div>

      <div className="space-y-2">
        <div className="relative overflow-hidden h-20">{renderInput()}</div>

        <div className="flex justify-between">
          {currentInput > 0 && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-200 text-dark hover:bg-dark-blue hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <GoArrowLeft /> Back
            </button>
          )}

          <button
            onClick={handleNextClick}
            className={`flex items-center gap-2 px-4 py-2 bg-dark-blue text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-gray-500 ${
              currentInput === 0 ? "ml-auto" : ""
            }`}
          >
            Next <GoArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardForm;
