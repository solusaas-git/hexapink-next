"use client";

import NextImage from "next/image";
import React, { useState } from "react";


import LocationTab from "@/components/home/elements/desktop/LocationTab";
import FolderTab from "@/components/home/elements/desktop/FolderTab";
import { Collection } from "@/types";
import { getFullFileUrl } from "@/lib/utils/fileUtils";

interface CollectionCard {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCard> = ({ collection }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="min-w-[480px] min-h-[260px] max-w-[480px] max-h-[260px] rounded-2xl bg-[#FFE5EE] hover:bg-dark text-dark transition ease-in hover:text-light-gray-1 relative z-10 font-raleway"
    >
      <div className="absolute right-0 top-0 w-auto h-full z-10 card_image_mask rounded-r-2xl">
        <NextImage
          crossOrigin="anonymous"
          alt="collection image"
          src={getFullFileUrl(collection?.image ?? "")}
          width={480}
          height={260}
          className="w-full h-full select-none object-cover"
        />
      </div>
      <div className="left-0 bottom-1 absolute w-[35%] h-auto -z-10 logo-mask">
        <div
          className={`${hover ? "bg-[#222222]" : "bg-light-pink-1"} w-64 h-32`}
        ></div>
      </div>
      <div className="flex flex-col justify-start items-start gap-3 w-[58%] h-full ml-7 mt-12">
        <h1
          className={`text-2xl font-kanit font-bold select-none ${
            hover ? "text-light-pink-1" : "text-dark"
          }`}
        >
          {collection?.title}
        </h1>
        <p
          className={`text-wrap text-sm text-left font-raleway font-medium line-clamp-6 ${
            hover ? "text-light-pink" : "text-light-dark"
          } select-none`}
        >
          {collection?.description}
        </p>
      </div>
      <div className="absolute left-0 -top-[20px]">
        {collection?.countries && collection?.countries.length > 0 && (
          <LocationTab text={collection?.countries[0]} hover={hover} />
        )}
      </div>
      <div className="absolute left-0 -top-[20px]">
        <FolderTab
          text={collection?.type === "Business" ? "B2B" : "B2C"}
          hover={hover}
        />
      </div>
    </div>
  );
};

export default CollectionCard;
