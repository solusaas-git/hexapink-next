"use client";

import React from "react";
interface CheckBoxProps {
  text: string;
  checked: boolean;
  handleChange: () => void;
}
const CheckBox: React.FC<CheckBoxProps> = ({ text, checked, handleChange }) => {
  return (
    <fieldset>
      <div className="space-y-9">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex h-8 shrink-0 items-center">
            <div className="group grid size-5 grid-cols-1">
              <input
                id="checkbox"
                name="checkbox"
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                aria-describedby="comments-description"
                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-[#FF6699] checked:bg-[#FF6699] indeterminate:border-[#FF6699] indeterminate:bg-[#FF6699] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6699] disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:checked]:opacity-100"
                />
                <path
                  d="M3 7H11"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:indeterminate]:opacity-100"
                />
              </svg>
            </div>
          </div>
          <label
            htmlFor="checkbox"
            className="w-full font-raleway font-medium text-dark text-left text-md lg:text-lg"
          >
            {text}
          </label>{" "}
        </div>
      </div>
    </fieldset>
  );
};

export default CheckBox;
