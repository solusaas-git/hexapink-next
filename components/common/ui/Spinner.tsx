"use client";

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", color = "#FF69B4" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full animate-spin`}
          style={{
            borderColor: `${color}20`,
            borderTopColor: color,
          }}
        ></div>
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"} rounded-full animate-pulse`}
            style={{ backgroundColor: `${color}10` }}
          ></div>
        </div>
      </div>
      
      {size !== "sm" && (
        <div className="flex items-center gap-1">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
            •
          </span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
            •
          </span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
            •
          </span>
        </div>
      )}
    </div>
  );
};

export default Spinner;

