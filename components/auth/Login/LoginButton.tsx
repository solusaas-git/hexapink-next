"use client";

import React, { useRef } from "react";

interface LoginButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const handleMouseEnterCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#FF6699");
      });
    }
  };
  
  const handleMouseLeaveCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "white");
      });
    }
  };
  
  return (
    <div className="login-button border z-10 cursor-pointer" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        <svg
          ref={svgRef}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_33_3034)">
            <path
              d="M2.25 12H12.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 8.25L12.75 12L9 15.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.75 3.75H18.75V20.25H12.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_33_3034">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        {children}
      </div>
    </div>
  );
};

export default LoginButton;

