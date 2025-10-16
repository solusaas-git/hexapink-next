"use client";

import React from "react";

import { GrLocation } from "react-icons/gr";
interface LocationTabMobileProps {
  text: string;
}
const LocationTabMobile: React.FC<LocationTabMobileProps> = ({
  text,
}) => {
  return (
    <div className="w-[225px] h-[40px] bg-[#FFE5EE] text-dark hexapink-card-locationtab font-raleway font-medium flex justify-start pl-24 ml-2 pr-4 items-center">
      <div className="pb-1">
        <GrLocation />
      </div>
      <span className="max-w-24 truncate text-sm text-nowrap">{text}</span>
    </div>
  );
};

export default LocationTabMobile;
