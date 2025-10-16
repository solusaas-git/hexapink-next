"use client";

import { useRouter } from "next/navigation";


import { Collection } from "@/types";

import CustomFileButton from "@/components/home/elements/CustomFileButton";
import CollectionCard from "@/components/home/elements/CollectionCard";

export default function Hero({ collections }: { collections: Collection[] }) {
  const navigate = useRouter();

  const handleCustomFileButton = () => {
    navigate.push("/user/files/new");
  };
  return (
    <div className="w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 py-8 flex flex-col items-center lg:flex-row gap-12 relative">
      <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-8">
        <h1 className="font-kanit font-bold text-left text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-pattern">
          <span className="text-dark/80">Think Data,</span>
          <br />
          <span className="text-dark/80">Think</span>&nbsp;
          <span className="text-pink/80">
            <span>Hexapink</span>
          </span>
        </h1>

        <p className="text-left font-raleway font-medium text-md sm:text-xl text-light-dark">
          Empower your sales and marketing strategy with precise, tailor-made
          B2B & B2C lead databases. With Hexapink, finding quality leads has
          never been easier.
        </p>
        <div className="hidden lg:flex lg:justify-start justify-center items-start">
          <CustomFileButton onClick={handleCustomFileButton} active={true}>
            Unlock Leads Now
          </CustomFileButton>
        </div>
        <div className="flex lg:hidden lg:justify-start justify-center items-start">
          <CustomFileButton onClick={handleCustomFileButton} mobile>
            Unlock Leads Now
          </CustomFileButton>
        </div>
      </div>

      <div className="lg:w-1/2 py-12 hidden sm:flex flex-col gap-12 min-h-[700px] max-h-[700px] overflow-y-auto scroll-hidden">
        {collections.length > 0 &&
          collections.map((collection, index) => (
            <div
              key={index}
              className={`w-full flex ${
                index % 3 === 0
                  ? "justify-end"
                  : index % 3 === 1
                  ? "justify-center"
                  : "justify-start"
              }`}
            >
              <CollectionCard collection={collection} />
            </div>
          ))}
      </div>

      <div className="w-full mt-12 flex flex-col gap-12 sm:hidden z-10">
        {collections.length > 0 &&
          collections.map((collection) => (
            <CollectionCard key={collection._id} collection={collection} />
          ))}
      </div>
    </div>
  );
}
