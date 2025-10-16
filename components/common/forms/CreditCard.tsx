"use client";

import NextImage from "next/image";
import React from "react";
import { CardDetails } from "@/types";
import { CreditCard as CreditCardIcon } from "lucide-react";

const VisaIcon = "/assets/CartLogos/visa_icon.webp";
const MasterCardIcon = "/assets/CartLogos/mastercard_icon.webp";
const DiscoverIcon = "/assets/CartLogos/discover_icon.webp";
const AmexIcon = "/assets/CartLogos/amex_icon.webp";

interface CreditCardProps {
  cardDetails: CardDetails;
  isFlipped: boolean;
  focusedField: keyof CardDetails | null;
}

const CreditCard: React.FC<CreditCardProps> = ({
  cardDetails,
  isFlipped,
  focusedField,
}) => {
  const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = cardDetails;

  // Determine card type based on first digits
  const getCardType = () => {
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = parseInt(cardNumber.substring(0, 2));

    if (firstDigit === "4") {
      return "visa";
    } else if (
      firstDigit === "5" ||
      (firstTwoDigits >= 51 && firstTwoDigits <= 55)
    ) {
      return "mastercard";
    } else if (
      firstDigit === "3" &&
      (cardNumber.charAt(1) === "4" || cardNumber.charAt(1) === "7")
    ) {
      return "amex";
    } else if (cardNumber.substring(0, 4) === "6011") {
      return "discover";
    }
    return "unknown";
  };

  const cardType = getCardType();

  // Render card logo based on type
  const renderCardLogo = () => {
    switch (cardType) {
      case "visa":
        return <NextImage src={VisaIcon} alt="Visa" width={32} height={32} className="h-8 w-8" />;
      case "mastercard":
        return (
          <NextImage src={MasterCardIcon} alt="MasterCard" width={32} height={32} className="h-8 w-8" />
        );
      case "amex":
        return <NextImage src={AmexIcon} alt="Amex" width={32} height={32} className="h-8 w-8" />;
      case "discover":
        return <NextImage src={DiscoverIcon} alt="Discover" width={32} height={32} className="h-8 w-8" />;
      default:
        return <CreditCardIcon size={32} />;
    }
  };

  // Format card number with masking
  const formatCardNumber = () => {
    const masked = "XXXX XXXX XXXX XXXX";
    if (!cardNumber) return masked;

    let result = "";
    let cardIndex = 0;

    for (let i = 0; i < masked.length; i++) {
      if (masked[i] === "X") {
        if (cardIndex < cardNumber.length) {
          result += cardNumber[cardIndex];
          cardIndex++;
        } else {
          result += "X";
        }
      } else {
        result += masked[i];
      }
    }

    return result;
  };

  return (
    <div className="relative w-full max-w-[400px] h-[220px] perspective-1000 mx-auto">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-xl text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-xs text-left uppercase tracking-wider opacity-80">
              Credit Card
            </div>
            {renderCardLogo()}
          </div>

          <div className="text-center my-4">
            <div
              className={`text-xl font-mono tracking-wider ${
                focusedField === "cardNumber"
                  ? "border-2 border-light-gray-3 rounded-lg p-1"
                  : ""
              }`}
            >
              {formatCardNumber()}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col items-start">
              <div className="text-xs text-left uppercase tracking-wider opacity-80 mb-1">
                Card Holder
              </div>
              <div
                className={`font-medium truncate text-left border-2 p-1 ${
                  focusedField === "cardHolder"
                    ? "border-light-gray-3 rounded-lg"
                    : "border-transparent"
                }`}
              >
                {cardHolder || "NAME SURNAME"}
              </div>
            </div>

            <div className="flex flex-col text-right">
              <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                Valid Thru
              </div>
              <div
                className={`p-1 border-2 ${
                  focusedField === "expiryMonth" ||
                  focusedField === "expiryYear"
                    ? "border-light-gray-3 rounded-lg"
                    : "border-transparent"
                }`}
              >
                {expiryMonth || "MM"}
                <span
                  className={`${
                    focusedField === "expiryMonth" ? "text-yellow-300" : ""
                  }`}
                >
                  /
                </span>
                {expiryYear || "YY"}
              </div>
            </div>
          </div>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gray-800 rounded-xl shadow-xl">
          <div className="w-full h-10 bg-gray-900 mt-4"></div>
          <div className="px-6 mt-4">
            <div className="flex justify-end items-center">
              <div
                className={`bg-gray-200 rounded-lg h-10 w-full max-w-[60%] flex items-center justify-end pr-3 ${
                  focusedField === "cvv"
                    ? "border-2 border-light-gray-3 rounded-lg"
                    : ""
                }`}
              >
                <div className="font-mono text-gray-800">{cvv || "•••"}</div>
              </div>
            </div>
            <div className="w-full mt-4 justify-end">{renderCardLogo()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
