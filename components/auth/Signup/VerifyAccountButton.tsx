"use client";

import React, { useRef } from "react";


const VerifyAccountButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleMouseEnterCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#FF6699"); // Change to your desired hover color
      });
    }
  };
  const handleMouseLeaveCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "white"); // Change to your desired hover color
      });
    }
  };
  return (
    <div className="createaccount-button border z-10" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        <svg
          ref={svgRef}
          width="25"
          height="24"
          viewBox="0 0 25 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_98_5001)">
            <path
              d="M10.2029 15C13.3095 15 15.8279 12.4816 15.8279 9.375C15.8279 6.2684 13.3095 3.75 10.2029 3.75C7.09628 3.75 4.57788 6.2684 4.57788 9.375C4.57788 12.4816 7.09628 15 10.2029 15Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.32788 18.75C4.25444 16.4578 6.97413 15 10.2029 15C13.4316 15 16.1513 16.4578 18.0779 18.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.8279 13.5L20.3279 15L23.3279 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_98_5001">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(0.0778809)"
              />
            </clipPath>
          </defs>
        </svg>
        {children}
      </div>
    </div>
  );
};

export default VerifyAccountButton;
