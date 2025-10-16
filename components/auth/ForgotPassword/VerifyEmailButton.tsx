"use client";

import React, { useRef } from "react";
import { BsSendCheck } from "react-icons/bs";

interface VerifyEmailButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const VerifyEmailButton: React.FC<VerifyEmailButtonProps> = ({ onClick, children }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  
  const handleMouseEnterCustom = () => {
    if (iconRef.current) {
      iconRef.current.style.color = "#FF6699";
    }
  };
  
  const handleMouseLeaveCustom = () => {
    if (iconRef.current) {
      iconRef.current.style.color = "white";
    }
  };
  
  return (
    <div className="login-button border cursor-pointer" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        <div ref={iconRef} className="transition-colors">
          <BsSendCheck />
        </div>
        {children}
      </div>
    </div>
  );
};

export default VerifyEmailButton;

