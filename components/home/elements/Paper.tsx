"use client";

import NextImage from "next/image";
import React from "react";

interface HexapinkPaperProps {
  topImage: string;
  bottomImage: string;
  desktopButtons: React.ReactNode;
  mobileButtons: React.ReactNode;
  text: string;
}
const HexapinkPaper: React.FC<HexapinkPaperProps> = ({
  topImage,
  bottomImage,
  desktopButtons,
  mobileButtons,
  text,
}) => {
  return (
    <div className="w-full lg:mx-12 lg:h-auto min-h-[500px] max-h-[600px] xl:h-[550px] relative bg-[#FFE5EE] rounded-[10px] px-8 sm:p-12 lg:px-24 py-8 lg:py-12 flex flex-col justify-start items-start gap-4 overflow-hidden">
      <NextImage
        src={topImage}
        alt="number image"
        width={40}
        height={40}
        className="w-8 xl:w-10 select-none"
      />
      <NextImage
        src={bottomImage}
        alt=""
        width={200}
        height={150}
        className="select-none w-1/2 sm:w-1/3 absolute bottom-0 right-0"
      />
      <h1 className="text-left font-kanit font-bold text-2xl lg:text-2xl xl:text-4xl text-dark lg:w-[80%] w-[90%] select-none">
        {text}
      </h1>
      <div className="mt-4 xl:flex justify-start items-end gap-5 z-10 bottom-[40%] xl:bottom-[15%] hidden">
        {desktopButtons}
      </div>
      <div className="mt-4 flex justify-start items-end gap-5 z-10 bottom-24 md:bottom-[20%] lg:bottom-[15%] xl:hidden">
        {mobileButtons}
      </div>
    </div>
  );
};

export default HexapinkPaper;
