"use client";

import NextImage from "next/image";
import { getFullFileUrl } from "@/lib/utils/fileUtils";
import Reviewer from "@/components/home/elements/desktop/Reviewer";
import { FaStar } from "react-icons/fa"; // Import star icon

interface TestimonialItemProps {
  image: string;
  text: string;
  name: string;
    company: string;
  position: string;
  rating?: number; // Optional rating prop
}

export default function TestimonialItem({
  image,
  text,
  name,
  company,
  position,
  rating,
}: TestimonialItemProps) {
  return (
    <div className="w-full sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 flex justify-center items-center z-20 flex-col gap-16">
      <div className="flex flex-col items-center gap-4">
        <div className="hexagon flex items-center justify-center w-28 lg:w-40 p-[1px] bg-[#FF99BB]">
          <NextImage
            src={getFullFileUrl(image)}
            crossOrigin="anonymous"
            alt={name}
            width={160}
            height={160}
            className="hexagon"
          />
        </div>

        {rating && (
          <div className="text-white text-center flex gap-1 py-4">
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                color={index < rating ? "#FF6699" : ""}
                className="text-xl lg:text-3xl"
              />
            ))}
          </div>
        )}
      </div>

      <h1 className="w-full px-8 sm:px-12 lg:px-0 lg:w-4/5 2xl:w-3/4 font-kanit font-bold text-[18px] sm:text-[24px] xl:text-[35px] 2xl:text-[40px] text-center text-white line-clamp-3 lg:line-clamp-2">
        {text}
      </h1>
      <Reviewer fullName={name} positionOfCompany={`${position} of ${company}`} />
    </div>
  );
}
