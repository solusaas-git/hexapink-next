"use client";

import NextImage from "next/image";
import React from "react";

import FolderTabMobile from "@/components/home/elements/mobile/FolderTabMobile";
import LocationTabMobile from "@/components/home/elements/mobile/LocationTabMobile";
import { Collection } from "@/types";
import { getFullFileUrl } from "@/lib/utils/fileUtils";

interface CollectionCardMobileProps {
  collection: Collection;
}
const CollectionCardMobile: React.FC<CollectionCardMobileProps> = ({ collection }) => {
  return (
    <div className="min-h-[320px] w-full h-[420px] rounded-2xl bg-[#FFE5EE] relative -z-0">
      <div className="right-0 top-8 absolute w-[30%] h-auto -z-10 logo-mask">
        <div className="bg-light-pink-1 h-32"></div>
      </div>
      <div className="w-full h-full px-8 py-12 flex flex-col justify-start items-center gap-3">
        <h1 className="w-full text-left text-2xl font-kanit font-bold text-[#333333] select-none">
          {collection?.title}
        </h1>
        <p className="text-left text-sm font-raleway font-medium text-light-dark select-none">
          {collection.description}
        </p>
      </div>
      <div className="absolute bottom-0 right-0 w-full h-auto card_image_mask_m rounded-b-xl">
        <NextImage
          crossOrigin="anonymous"
          src={getFullFileUrl(collection?.mobileImage ?? "")}
          alt="collection image"
          width={300}
          height={200}
          className="w-full h-full select-none object-cover"
        />
      </div>
      <div className="absolute left-0 -top-[20px]">
        {collection?.countries && collection?.countries.length > 0 && (
          <LocationTabMobile text={collection?.countries[0]} />
        )}
      </div>
      <div className="absolute left-0 -top-[20px]">
        <FolderTabMobile
          text={collection?.type === "Business" ? "B2B" : "B2C"}
        />
      </div>
    </div>
  );
};

export default CollectionCardMobile;
