"use client";

import React from "react";
import { PiFolderOpenLight } from "react-icons/pi";



interface FolderTabProps {
  text: string;
  hover: boolean;
}
const FolderTab: React.FC<FolderTabProps> = ({ text, hover }) => {
  return (
    <div
      className={`w-[98px] h-[40px] ${
        hover ? "bg-[#222222] text-light-pink-1" : "bg-[#FFCCDD] text-dark"
      } hexapink-card-foldertab font-raleway font-medium flex justify-start px-3 items-center gap-2 -z-30`}
    >
      <PiFolderOpenLight className="text-xl" />
      <span>{text}</span>
    </div>
  );
};
export default FolderTab;
