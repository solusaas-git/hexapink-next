"use client";

import React from "react";
import { PiFolderOpenLight } from "react-icons/pi";

interface FolderTabProps {
  text: string;
  hover?: boolean;
  mobile?: boolean;
}

const FolderTab: React.FC<FolderTabProps> = ({ text, hover = false, mobile = false }) => {
  return (
    <div
      className={`w-[98px] h-[40px] ${
        hover ? "bg-[#222222] text-light-pink-1" : "bg-[#FFCCDD] text-dark"
      } hexapink-card-foldertab font-raleway font-medium flex justify-start px-3 items-center gap-2 -z-30`}
    >
      <PiFolderOpenLight className={mobile ? "text-lg" : "text-xl"} />
      <span className={mobile ? "text-sm" : ""}>{text}</span>
    </div>
  );
};

export default FolderTab;

