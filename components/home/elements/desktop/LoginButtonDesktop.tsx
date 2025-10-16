"use client";

import React from "react";

interface HexagonLoginButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active: boolean;
}

const HexagonLoginButton: React.FC<HexagonLoginButtonProps> = ({
  onClick,
  children,
  active,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`hexagon-login-button ${active ? "border" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: "pointer",
        position: "relative",
        display: "block",
        background: "transparent",
        width: "150px",
        height: "50px",
        lineHeight: "50px",
        textAlign: "center",
        fontSize: "20px",
        color: "#333333",
        margin: "40px auto",
        boxSizing: "border-box",
        borderStyle: "none",
      }}
    >
      <div className="flex justify-center items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_33_3034)">
            <path
              d="M2.25 12H12.75"
              stroke={isHovered ? "#FFCCDD" : "#333333"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 8.25L12.75 12L9 15.75"
              stroke={isHovered ? "#FFCCDD" : "#333333"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.75 3.75H18.75V20.25H12.75"
              stroke={isHovered ? "#FFCCDD" : "#333333"}
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
        <span>{children}</span>
      </div>
    </div>
  );
};

export default HexagonLoginButton;
