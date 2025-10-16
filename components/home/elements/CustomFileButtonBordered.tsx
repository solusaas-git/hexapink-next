"use client";

import React, { useRef } from "react";


const CustomFileButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleMouseEnterCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#333333"); // Change to your desired hover color
      });
    }
  };
  const handleMouseLeaveCustom = () => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("stroke", "#FFCCDD"); // Change to your desired hover color
      });
    }
  };
  return (
    <div className="custom-file-button-b border" onClick={onClick}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        <svg
          ref={svgRef}
          width="33"
          height="33"
          viewBox="0 0 33 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.98218 16.5009V19.8931C5.98218 24.2197 5.98218 26.3832 7.1636 27.8484C7.40228 28.1444 7.67192 28.4141 7.96795 28.6528C9.43326 29.8343 11.5966 29.8343 15.9232 29.8343C16.864 29.8343 17.3343 29.8343 17.7651 29.6823C17.8547 29.6505 17.9424 29.6143 18.0282 29.5732C18.4403 29.3761 18.7728 29.0436 19.438 28.3784L25.7534 22.0629C26.5242 21.2923 26.9095 20.9068 27.1126 20.4168C27.3155 19.9268 27.3155 19.3817 27.3155 18.2917V13.8343C27.3155 8.8059 27.3155 6.29176 25.7534 4.72965C24.3412 3.31744 22.1508 3.18195 18.0282 3.16895M17.9822 29.1676V28.5009C17.9822 24.7296 17.9822 22.844 19.1538 21.6724C20.3254 20.5009 22.211 20.5009 25.9822 20.5009H26.6488"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.6488 8.49972H5.98218M11.3155 3.16638V13.833"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {children}
      </div>
    </div>
  );
};

export default CustomFileButton;
