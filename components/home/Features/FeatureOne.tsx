"use client";

import Image from "next/image";

const slashImg = "/assets/TheHomePage/image/line.svg";
const Backgroundimage2 = "/assets/TheHomePage/image/group_13.webp";
const Backgroundimage2_M = "/assets/TheHomePage/image/bg2_m.webp";

export default function FeatureOne() {
  return (
    <div className="relative flex justify-center items-center w-full lg:h-[550px] h-[550px]">
      <div className="lg:flex absolute right-0 bottom-0 z-10 hidden">
        <Image src={Backgroundimage2} alt="" width={400} height={300} className="ml-auto select-none" />
      </div>
      <div className="w-2/3 sm:w-2/5 lg:hidden absolute right-0 -bottom-[70px] z-10">
        <Image src={Backgroundimage2_M} alt="" width={300} height={200} />
      </div>
      <div className="absolute w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 flex justify-start items-center top-20 z-20">
        <div className="w-3/4 sm:w-3/5 lg:w-[50%] flex flex-col justify-start items-center gap-2 sm:gap-8">
          <Image src={slashImg} alt="slash image" width={50} height={20} className="mr-auto" />
          <h1 className="font-kanit font-bold text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl text-left text-dark">
            Hexapink helps you find the leads you need in just a few clicks
          </h1>
          <p className="font-raleway font-medium lg:text-xl text-sm text-left text-light-dark">
            No more wasting time on outdated or irrelevant data. Hexapink
            delivers smart, filtered leads tailored to your exact criteria —
            saving time and increasing ROI.
          </p>
        </div>
      </div>
    </div>
  );
}
