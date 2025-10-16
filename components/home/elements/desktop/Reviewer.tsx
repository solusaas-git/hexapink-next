"use client";

import React from "react";
interface ReviewerProps {
  fullName: string;
  positionOfCompany: string;
}
const Reviewer: React.FC<ReviewerProps> = ({ fullName, positionOfCompany }) => {
  return (
    <div className="relative h-12 uppercase">
      <div className="bg-[#262626] w-[100px] sm:w-[160px] sm:h-[40px] h-[30px] cofoundertab-small-clip  font-[raleway-medium] flex justify-center items-center text-[#FFCCDD] sm:text-[16px] text-[12px] absolute sm:-left-[200px] -left-[150px] top-0 z-20">
        <span>{fullName}</span>
      </div>
      <div className="bg-[#262626] sm:w-[420px] sm:h-[40px] w-[320px] h-[30px] cofoundertab-big-clip  flex justify-center items-center absolute sm:-left-[200px] -left-[150px] top-0 z-0"></div>
      
      <div className="bg-dark w-[318px] h-[28px] sm:w-[418px] sm:h-[38px] cofoundertab-big-clip  flex justify-center items-center absolute sm:-left-[199px] -left-[149px] top-[1px] z-10"></div>
      <div className="absolute font-[raleway-medium] text-[#FFCCDD] sm:text-[16px] text-[12px] w-[200px] sm:w-[400px] z-20 -left-[50px] sm:-left-[120px] sm:top-[8px] top-[5px] text-center">
        {positionOfCompany}
      </div>
    </div>
  );
};
export default Reviewer;
