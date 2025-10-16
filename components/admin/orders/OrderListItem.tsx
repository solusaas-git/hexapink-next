import React from "react";
import { useRouter } from "next/navigation";
import { PiPackage } from "react-icons/pi";
import { CiCircleInfo } from "react-icons/ci";
import { FaRegUserCircle } from "react-icons/fa";
import { GoPaperclip } from "react-icons/go";
import Checkbox from "@/components/common/ui/Checkbox";

interface OrderData {
  _id: string;
  userId: string;
  userEmail: string;
  filesCount: number;
  volume: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface OrderListItemProps {
  data: OrderData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const OrderListItem: React.FC<OrderListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
}) => {
  const router = useRouter();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/orders/view/${data._id}`);
  };

  return (
    <div className="w-full flex items-center gap-2 text-light-dark">
      <Checkbox checked={isSelected} onChange={() => onCheckboxChange(index)} />
      <div
        className={`w-full bg-[#F7F7FC] flex border ${
          isSelected ? "border-dark-blue" : "border-light-gray-3"
        } rounded-lg`}
      >
        <div className="w-[12%] p-3 flex justify-between items-center">
          <div className="flex items-center">
            <PiPackage className="text-2xl mr-2 flex-shrink-0" />
            <span className="truncate">ord_{data._id.slice(-5)}</span>
          </div>
          <CiCircleInfo
            onClick={handleView}
            className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
          />
        </div>
        <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <FaRegUserCircle className="text-xl mr-2 flex-shrink-0" />
          <span className="truncate">{data.userEmail}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          <span>{data.filesCount}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          <span>{data.volume.toLocaleString()}</span>
        </div>
        <div className="w-[12%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          <span>${data.amount}</span>
        </div>
        <div className="w-[20%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          {data.status === "Paid" ? (
            <span className="text-green border border-light-green-1 bg-light-green-2 p-1 rounded-md text-sm">
              Paid
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="border border-light-gray-1 bg-light-gray-2 p-1 rounded-sm">
                Unpaid
              </span>
              <GoPaperclip className="text-xl ml-auto border rounded-md p-1 box-content" />
            </div>
          )}
        </div>
        <div className="w-[16%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          {formatDate(data.createdAt)}
        </div>
      </div>
    </div>
  );
};

