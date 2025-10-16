"use client";

export default function HexapinkPaperTwoFrame() {
  return (
    <div className="flex justify-center items-center gap-4">
      <div className="flex flex-col">
        <div className="w-3 h-3 rounded-full border-2 border-light-dark"></div>
        <div className="w-0 h-6 sm:h-8 ml-[5px] border border-r-1 border-light-dark"></div>
        <div className="w-3 h-3 rounded-full border-2 border-light-dark"></div>
        <div className="w-0 h-6 sm:h-8 ml-[5px] border border-r-1 border-light-dark"></div>
        <div className="w-3 h-3 rounded-full border-2 border-light-dark"></div>
      </div>
      <div className="flex flex-col justify-center items-start gap-2 sm:gap-4">
        <h1 className="font-raleway font-medium text-md sm:text-lg text-light-dark">
          Select Collection
        </h1>
        <h1 className="font-raleway font-medium text-md sm:text-lg text-light-dark">
          Select Location
        </h1>
        <h1 className="font-raleway font-medium text-md sm:text-lg text-light-dark">
          Specify your Lead
        </h1>
      </div>
    </div>
  );
}
