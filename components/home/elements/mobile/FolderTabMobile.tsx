"use client";

import React from "react";

import { PiFolderOpenLight } from "react-icons/pi";
interface FolderTabMobileProps {
  text: string;
}
const FolderTabMobile: React.FC<FolderTabMobileProps> = ({
  text,
}) => {
  return (
    <div className="w-[98px] h-[40px] bg-[#FFCCDD] text-dark hexapink-card-foldertab font-raleway font-medium flex justify-start px-3 items-center gap-2 -z-30">
      <PiFolderOpenLight className="text-lg" />
      <span className="text-sm">{text}</span>
    </div>
  );
};
export default FolderTabMobile;
