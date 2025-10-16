"use client";

import { RotatingLines } from "react-loader-spinner";

interface LoadingElementProps {
  width: string; // Define the width prop
  color: string;
}

const LoadingElement: React.FC<LoadingElementProps> = ({ width, color }) => {
  return (
    <RotatingLines
      visible={true}
      width={width}
      strokeColor={color}
      strokeWidth="5"
      animationDuration="0.75"
      ariaLabel="rotating-lines-loading"
    />
  );
};

export default LoadingElement;
