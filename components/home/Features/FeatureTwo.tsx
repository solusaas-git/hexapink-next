"use client";

import Image from "next/image";

const slashImg = '/assets/TheHomePage/image/line.svg'
const Backgroundimage3 = "/assets/TheHomePage/image/group_14.webp";
const Backgroundimage3_M = "/assets/TheHomePage/image/bg3_m.webp";


export default function FeatureTwo() {
  return (
    <div className="flex justify-center items-center w-full lg:h-[550px] h-[700px] relative">
      <div className="absolute top-0 left-0 -z-50 w-full h-full bg-light-pink sm:bg-[#FFF5F8] opacity-50"></div>
      <div className="lg:flex absolute left-0 bottom-0 z-10 hidden">
        <Image
          src={Backgroundimage3}
          alt="polygon image"
          width={400}
          height={300}
          className="select-none"
        />
      </div>
      <div className="w-2/3 sm:w-2/5 lg:hidden absolute left-0 bottom-0 z-10">
        <Image src={Backgroundimage3_M} alt="" width={300} height={200} />
      </div>
      <div className="absolute w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 flex justify-end items-center top-24 lg:top-20 z-30">
        <div className="w-3/4 sm:w-3/5 lg:w-[50%] flex flex-col justify-center items-end sm:items-start gap-2 sm:gap-8">
          <Image src={slashImg} alt="slash image" width={50} height={20} />
          <h1 className="text-right sm:text-left font-kanit font-bold text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl text-dark">
            Hexapink helps you scale smarter
          </h1>
          <p className="text-right sm:text-left font-raleway font-medium lg:text-xl text-sm text-light-dark">
            From startups to large enterprises, our platform supports every
            growth stage with reliable data, scalable lists, and
            conversion-ready contacts.
          </p>
        </div>
      </div>
    </div>
  );
}
