import NextImage from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegFolderOpen } from "react-icons/fa";
import { CiCircleInfo } from "react-icons/ci";
import { PiDatabaseLight, PiMapPinLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import Checkbox from "@/components/common/ui/Checkbox";
import SwitchButton from "@/components/common/ui/SwitchButton";
import Spinner from "@/components/common/ui/Spinner";
import { getFullFileUrl } from "@/lib/utils/fileUtils";

interface CollectionData {
  _id: string;
  title: string;
  image?: string;
  type?: string;
  countries?: string[];
  fee: number;
  status: "Active" | "Inactive";
  featured: boolean;
  createdAt: string;
  columns?: number; // Column count from API
}

interface CollectionListItemProps {
  data: CollectionData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onStatusChange: (collectionId: string, newStatus: string) => void;
  onFeaturedChange: (collectionId: string, featured: boolean) => void;
  onDelete: (collectionId: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const CollectionListItem: React.FC<CollectionListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onStatusChange,
  onFeaturedChange,
  onDelete,
}) => {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const handleStatusClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusLoading(true);
    const newStatus = data.status === "Active" ? "Inactive" : "Active";
    await onStatusChange(data._id, newStatus);
    setStatusLoading(false);
  };

  const handleFeaturedChange = async () => {
    setFeaturedLoading(true);
    await onFeaturedChange(data._id, !data.featured);
    setFeaturedLoading(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/collections/edit/${data._id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this collection?")) {
      onDelete(data._id);
    }
  };

  const handleShowPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/collections/view/${data._id}`);
  };

  const imageUrl = data.image ? getFullFileUrl(data.image) : null;

  return (
    <div className="w-full flex items-center gap-2 text-light-dark">
      <Checkbox checked={isSelected} onChange={() => onCheckboxChange(index)} />
      <div
        className={`w-full bg-[#F7F7FC] flex border ${
          isSelected ? "border-dark-blue" : "border-light-gray-3"
        } rounded-lg`}
      >
        <div className="w-[15%] p-3 flex justify-between items-center">
          <div className="flex items-center">
            <FaRegFolderOpen className="text-2xl mr-2 flex-shrink-0" />
            <span className="truncate">col_{data._id.slice(-5)}</span>
          </div>
          <CiCircleInfo
            onClick={handleShowPreview}
            className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
          />
        </div>
        <div className="w-[30%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          {imageUrl && (
            <div className="w-12 h-12 bg-[#F0F0FA] border border-light-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
              <NextImage
                src={imageUrl}
                alt={data.title}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-left truncate">{data.title}</span>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {data.type && (
                <div className="flex items-center">
                  <PiDatabaseLight className="text-md mr-1" />
                  <span>{data.type}</span>
                </div>
              )}
              {data.countries && data.countries.length > 0 && (
                <div className="flex items-center">
                  <PiMapPinLight className="text-lg mr-1" />
                  <span className="text-left">{data.countries[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span>{data.columns || 0}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span>${data.fee}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <div
            onClick={handleStatusClick}
            className={`rounded-lg px-2 py-1 text-sm flex items-center justify-center border cursor-pointer ${
              data.status === "Active"
                ? "bg-light-green-2 border-light-green-1 text-green hover:bg-green hover:text-white"
                : "bg-[#FAFAFA] border-[#E6E6E6] text-dark hover:bg-light-dark hover:text-white"
            }`}
          >
            {statusLoading ? <Spinner size="sm" color="#4040BF" /> : data.status}
          </div>
        </div>
        <div className="w-[10%] p-3 flex items-center justify-center border-l border-dashed border-light-gray-3">
          {featuredLoading ? (
            <Spinner size="sm" color="#4040BF" />
          ) : (
            <SwitchButton
              value={data.featured}
              disabled={false}
              onChange={handleFeaturedChange}
            />
          )}
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          {formatDate(data.createdAt)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <BiPencil
          onClick={handleEdit}
          className="cursor-pointer hover:text-dark-blue text-xl"
        />
        <BsTrash3
          onClick={handleDelete}
          className="cursor-pointer hover:text-red text-xl"
        />
      </div>
    </div>
  );
};

