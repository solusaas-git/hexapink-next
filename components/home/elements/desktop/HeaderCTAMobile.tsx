"use client";

import React, { useRef } from "react";


const HeaderCTAMobile: React.FC<{
  border: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ border, onClick, children }) => {
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
    <div
      className={`header-cta-mobile ${border ? "border" : ""}`}
      onClick={onClick}
    >
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        {children}
      </div>
    </div>
  );
};

export default HeaderCTAMobile;
