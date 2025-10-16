"use client";

import React, { useRef } from "react";


const SendMessageButton: React.FC<{
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}> = ({ onClick, children, disabled = false }) => {
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
    <button className="send-message-button border p-0 m-0" onClick={onClick} disabled={disabled}>
      <div
        className="flex justify-center items-center gap-2"
        onMouseEnter={handleMouseEnterCustom}
        onMouseLeave={handleMouseLeaveCustom}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_9_3092)">
            <path
              d="M13.5 12H7.5"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.54597 20.745C4.49324 20.889 4.48592 21.0457 4.52502 21.194C4.56412 21.3423 4.64774 21.4751 4.76462 21.5744C4.8815 21.6737 5.02602 21.7348 5.17869 21.7494C5.33136 21.764 5.48485 21.7315 5.61847 21.6562L21.3685 12.6478C21.4857 12.5829 21.5834 12.4878 21.6514 12.3724C21.7195 12.257 21.7554 12.1255 21.7554 11.9915C21.7554 11.8575 21.7195 11.726 21.6514 11.6106C21.5834 11.4952 21.4857 11.4001 21.3685 11.3353L5.61847 2.34933C5.48526 2.27483 5.33248 2.24274 5.18055 2.25735C5.02863 2.27197 4.88477 2.33259 4.7682 2.43112C4.65164 2.52965 4.56791 2.6614 4.5282 2.80878C4.48849 2.95615 4.49469 3.11213 4.54597 3.25589L7.50003 12L4.54597 20.745Z"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_9_3092">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        {children}
      </div>
    </button>
  );
};

export default SendMessageButton;
