"use client";

import React, { useRef } from "react";


const HexagonLoginButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleMouseEnterLogin = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#FFCCDD"); // Change to your desired hover color
      });
    }
  };
  const handleMouseLeaveLogin = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#333333"); // Default color
      });
    }
  };
  return (
    <div className="back-button border z-10" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterLogin}
        onMouseLeave={handleMouseLeaveLogin}
      >
        <svg
          ref={svgRef}
          width="25"
          height="24"
          viewBox="0 0 25 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_98_5135)">
            <path
              d="M20.3279 12H3.82788"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5779 5.25L3.82788 12L10.5779 18.75"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_98_5135">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(0.0778809)"
              />
            </clipPath>
          </defs>
        </svg>
        <span>{children}</span>
      </div>
    </div>
  );
};

export default HexagonLoginButton;
