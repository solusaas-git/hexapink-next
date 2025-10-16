"use client";

import React, { useRef } from "react";
import { Collection } from "@/types";
import CollectionCard from "@/components/home/elements/CollectionCard";

export default function RecommendedCollections({
  collections,
}: {
  collections: Collection[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - scrollContainerRef.current!.offsetLeft;
    scrollLeft = scrollContainerRef.current!.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
  };

  const handleMouseUp = () => {
    isDown = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollContainerRef.current!.scrollLeft = scrollLeft - walk;
  };
  return (
    <div className="px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 py-16 flex flex-col justify-start items-center ">
      <div className="w-full flex justify-start items-center">
        <div className="flex flex-col justify-start items-start gap-4 lg:w-[50%] w-[80%] h-[100%]">
          <h1 className="text-left text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl text-dark font-kanit font-bold">
            Recommended Collections
          </h1>
          <p className="text-left text-md lg:text-xl font-raleway font-medium text-light-dark">
            If you have a specific need in mind, sent an email to
            Contact@hexapink.com
          </p>
        </div>
      </div>
      <div
        className="w-full min-h-[350px] mt-8 lg:flex justify-start items-center gap-6 overflow-x-auto scroll-hidden hidden"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {collections.map((collection) => (
          <CollectionCard key={collection._id} collection={collection} />
        ))}
      </div>
      <div className="w-full pt-12 flex flex-col gap-12 lg:hidden">
        {collections.map((collection) => (
          <CollectionCard key={collection._id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
