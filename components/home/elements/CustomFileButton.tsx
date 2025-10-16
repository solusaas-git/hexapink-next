"use client";

import React, { useRef } from "react";

interface CustomFileButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  mobile?: boolean;
}

const CustomFileButton: React.FC<CustomFileButtonProps> = ({ 
  onClick, 
  children, 
  active = true,
  mobile = false 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const handleMouseEnterCustom = () => {
    if (svgRef.current && (mobile || active)) {
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

  // Desktop version
  if (!mobile) {
    return (
      <div className={`custom-file-button ${active ? "border" : ""}`} onClick={onClick}>
        <div
          className="flex justify-center items-center gap-2"
          onMouseEnter={handleMouseEnterCustom}
          onMouseLeave={handleMouseLeaveCustom}
        >
          <svg
            ref={svgRef}
            width="24"
            height="24"
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
  }

  // Mobile version
  return (
    <div className="custom-file-button-m border" onClick={onClick}>
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
          <path
            d="M4 12.0005V14.5446C4 17.7896 4 19.4122 4.88607 20.5111C5.06508 20.7331 5.26731 20.9354 5.48933 21.1144C6.58831 22.0005 8.21082 22.0005 11.4558 22.0005C12.1614 22.0005 12.5141 22.0005 12.8372 21.8865C12.9044 21.8627 12.9702 21.8355 13.0345 21.8047C13.3436 21.6569 13.593 21.4075 14.0919 20.9086L18.8284 16.172C19.4065 15.594 19.6955 15.3049 19.8478 14.9374C20 14.5699 20 14.1611 20 13.3436V10.0005C20 6.22925 20 4.34364 18.8284 3.17206C17.7693 2.1129 16.1265 2.01128 13.0345 2.00153M13 21.5005V21.0005C13 18.172 13 16.7578 13.8787 15.8791C14.7574 15.0005 16.1716 15.0005 19 15.0005H19.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5.99957H4M8 1.99957V9.99957"
            stroke="white"
            strokeWidth="2"
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

