import NextImage from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { FaRegStar, FaStar } from "react-icons/fa";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import { CiCircleInfo } from "react-icons/ci";
import Checkbox from "@/components/common/ui/Checkbox";

interface ReviewData {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  featured: boolean;
}

interface ReviewListItemProps {
  data: ReviewData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onToggleFeatured: (reviewId: string) => void;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

export const ReviewListItem: React.FC<ReviewListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onToggleFeatured,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/reviews/view/${data._id}`);
  };

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFeatured(data._id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(data._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this review?")) {
      onDelete(data._id);
    }
  };

  return (
    <div className="w-full flex items-center gap-2 text-light-dark">
      <Checkbox checked={isSelected} onChange={() => onCheckboxChange(index)} />
      <div
        className={`w-full bg-[#F7F7FC] flex border ${
          isSelected ? "border-dark-blue" : "border-light-gray-3"
        } rounded-lg`}
      >
        <div className="w-[25%] p-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {data.avatar && (
              <NextImage
                src={data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`}
                alt={`${data.firstName} ${data.lastName}`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            )}
            <span className="font-semibold truncate">
              {data.firstName} {data.lastName}
            </span>
          </div>
          <CiCircleInfo
            onClick={handleView}
            className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
          />
        </div>
        <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="truncate">{data.company}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              i < data.rating ? (
                <FaStar key={i} className="text-yellow-400 text-sm" />
              ) : (
                <FaRegStar key={i} className="text-gray-300 text-sm" />
              )
            ))}
          </div>
        </div>
        <div className="w-[30%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="line-clamp-2 text-sm">{data.content}</span>
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <button
            onClick={handleToggleFeatured}
            className={`px-3 py-1 rounded text-xs font-medium ${
              data.featured
                ? "bg-light-blue text-dark-blue border border-dark-blue"
                : "bg-light-gray-2 text-light-dark border border-light-gray-3"
            }`}
          >
            {data.featured ? "Featured" : "Not Featured"}
          </button>
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

