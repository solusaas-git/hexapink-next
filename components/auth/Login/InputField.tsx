"use client";

import React from "react";

interface InputFieldProps {
  title: string;
  placeholder: string;
  type: string;
  value: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  title,
  value,
  placeholder,
  error,
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className="relative mt-2 w-full flex flex-col items-start focus-within:text-pink">
        <label
          htmlFor={title}
          className="text-[14px] font-raleway font-semibold transition-colors peer-focus:text-pink-500 tracking-wider"
        >
          {title}
        </label>
        <input
          id={title}
          name={title}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="peer block w-full bg-transparent border-b focus:border-pink p-2 text-gray-900 placeholder:text-gray-500 focus:outline-none sm:text-[16px] font-raleway font-medium tracking-wider"
        />
        {error && (
          <span className="text-red text-sm font-raleway tracking-wider mt-1">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;

