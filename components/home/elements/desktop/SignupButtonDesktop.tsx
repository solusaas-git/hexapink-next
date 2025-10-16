"use client";

import React from "react";

interface HexagonSignupButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active: boolean;
}

const HexagonSignupButton: React.FC<HexagonSignupButtonProps> = ({
  onClick,
  children,
  active,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`hexagon-signup-button ${active ? "border" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <div className="flex justify-center items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g clipPath="url(#clip0_33_3044)">
            <path
              d="M18.75 12.75H23.25"
              stroke={isHovered && active ? "#333333" : "#FFCCDD"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 10.5V15"
              stroke={isHovered && active ? "#333333" : "#FFCCDD"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.125 15C13.2316 15 15.75 12.4816 15.75 9.375C15.75 6.2684 13.2316 3.75 10.125 3.75C7.0184 3.75 4.5 6.2684 4.5 9.375C4.5 12.4816 7.0184 15 10.125 15Z"
              stroke={isHovered && active ? "#333333" : "#FFCCDD"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.25 18.75C4.17656 16.4578 6.89625 15 10.125 15C13.3537 15 16.0734 16.4578 18 18.75"
              stroke={isHovered && active ? "#333333" : "#FFCCDD"}
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

export default HexagonSignupButton;
