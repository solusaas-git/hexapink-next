"use client";

import React from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";

const CustomCardInput: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full p-2 border border-gray-300 rounded">
        <label>Card Number</label>
        <CardNumberElement className="w-full p-2" />
      </div>
      <div className="w-full p-2 border border-gray-300 rounded">
        <label>Expiry Date</label>
        <CardExpiryElement className="w-full p-2" />
      </div>
      <div className="w-full p-2 border border-gray-300 rounded">
        <label>CVC</label>
        <CardCvcElement className="w-full p-2" />
      </div>
    </div>
  );
};

export default CustomCardInput;
