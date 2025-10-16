"use client";

import React from "react";
import { GrLocation } from "react-icons/gr";

interface LocationTabProps {
  text: string;
  hover?: boolean;
  mobile?: boolean;
}

const LocationTab: React.FC<LocationTabProps> = ({ text, hover = false, mobile = false }) => {
  return (
    <div
      className={`w-[225px] h-[40px] ${
        hover ? "bg-dark text-light-pink-1" : "bg-[#FFE5EE] text-dark"
      } hexapink-card-locationtab font-raleway font-medium flex justify-start pl-24 ml-2 pr-4 items-center`}
    >
      <div className="pb-1">
        <GrLocation className={mobile ? "" : "text-lg"} />
      </div>
      <span className="max-w-24 truncate text-sm text-nowrap">{text}</span>
    </div>
  );
};

export default LocationTab;

