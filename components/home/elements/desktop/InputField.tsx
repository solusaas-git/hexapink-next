"use client";

import React from "react";
interface InputFieldProps {
  title: string;
  placeholder: string;
  type: string;
  value: string;
  setValue: (val: string) => void;
}
const InputField: React.FC<InputFieldProps> = ({
  type,
  title,
  placeholder,
  value,
  setValue,
}) => {
  return (
    <div className="flex flex-col w-full focus-within:text-pink" suppressHydrationWarning>
      <label
        htmlFor={title}
        className="font-raleway transition-colors peer-focus:text-pink-500 text-left"
      >
        {title}
      </label>
      <input
        id={title}
        name={title}
        autoComplete={title}
        autoCorrect="off"
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        placeholder={placeholder}
        className="peer block w-full bg-transparent border-b focus-within:border-pink py-1.5 text-gray-900 placeholder:text-gray-500 focus:outline-none sm:text-[16px] font-raleway font-medium"
        suppressHydrationWarning
      />
    </div>
  );
};

export default InputField;
