"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";

interface VerificationCodeInputProps {
  onChange: (code: string) => void;
}

export interface VerificationCodeInputRef {
  clear: () => void;
}

const VerificationCodeInput = forwardRef<VerificationCodeInputRef, VerificationCodeInputProps>(
  ({ onChange }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        inputRefs.current.forEach((input) => {
          if (input) {
            input.value = "";
          }
        });
      },
    }));

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedData = e.clipboardData.getData("Text").split("");
      inputRefs.current.forEach((input, index) => {
        if (pastedData[index]) {
          input!.value = pastedData[index];
        }
      });
      onChange(pastedData.join(""));
    };

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const value = event.target.value;

      if (value.length > 1) {
        event.preventDefault();
        return;
      }

      if (/^[0-9]$/.test(value)) {
        const newCode = Array(6).fill("");
        newCode[index] = value;

        // Move to the next input
        if (index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
        onChange(newCode.join(""));
      } else if (value === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    };

    return (
      <div className="flex space-x-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            placeholder="#"
            className="w-10 h-10 text-center text-xl bg-transparent border-b border-dark  focus:outline-none focus:border-blue-500"
            ref={(el) => { inputRefs.current[index] = el; }}
            onChange={(e) => handleChange(e, index)}
            onPaste={handlePaste}
          />
        ))}
      </div>
    );
  }
);

export default VerificationCodeInput;
