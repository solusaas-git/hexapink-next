"use client";

import React from "react";
import { PiCheckBold } from "react-icons/pi";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <div
      className={`w-6 h-6 flex items-center justify-center border rounded cursor-pointer ${
        checked ? "bg-dark-blue text-white" : "bg-white"
      }`}
      onClick={() => onChange && onChange(!checked)}
    >
      <PiCheckBold
        className={`${checked ? "text-white" : "text-light-gray-3"}`}
      />
    </div>
  );
};

export default Checkbox;
