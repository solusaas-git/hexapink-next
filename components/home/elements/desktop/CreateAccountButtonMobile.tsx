"use client";

import React, { useRef } from "react";


const CreateAccountButton_M: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseEnterSignup = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#333333"); // Change to your desired hover color
      });
    }
  };
  const handleMouseLeaveSignup = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#333333"); // Change to your desired hover color
      });
    }
  };
  return (
    <div className="create-account-button-m z-10" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterSignup}
        onMouseLeave={handleMouseLeaveSignup}
      >
        <svg
          ref={svgRef}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g clipPath="url(#clip0_33_3044)">
            <path
              d="M18.75 12.75H23.25"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 10.5V15"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.125 15C13.2316 15 15.75 12.4816 15.75 9.375C15.75 6.2684 13.2316 3.75 10.125 3.75C7.0184 3.75 4.5 6.2684 4.5 9.375C4.5 12.4816 7.0184 15 10.125 15Z"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.25 18.75C4.17656 16.4578 6.89625 15 10.125 15C13.3537 15 16.0734 16.4578 18 18.75"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_33_3044">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span>{children}</span>
      </div>
    </div>
  );
};

export default CreateAccountButton_M;
