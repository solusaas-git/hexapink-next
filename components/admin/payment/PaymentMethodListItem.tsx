import React from "react";
import { PiBankLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import Checkbox from "@/components/common/ui/Checkbox";
import { formatDate } from "@/lib/utils/formatDate";

interface PaymentData {
  _id: string;
  type: string;
  paymentType: string;
  bankName: string;
  accountOwner?: string;
  accountNumber?: string;
  bankLogo?: string;
  qrCode?: string;
  iban?: string;
  rib?: string;
  swift?: string;
  publicKey?: string;
  secretKey?: string;
  status: string;
  createdAt: string;
}

interface PaymentMethodListItemProps {
  data: PaymentData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onDelete: (paymentId: string) => void;
  onEdit: (paymentId: string) => void;
}

export const PaymentMethodListItem: React.FC<PaymentMethodListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onDelete,
  onEdit,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this payment method?")) {
      onDelete(data._id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(data._id);
  };

  const getStatusColor = () => {
    switch (data.status.toLowerCase()) {
      case "active":
        return "bg-light-green-2 text-green";
      case "inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-light-gray text-gray-600";
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
        <div className="w-[20%] p-3 flex items-center">
          <PiBankLight className="text-2xl mr-2 flex-shrink-0" />
          <span className="font-semibold capitalize">{data.type}</span>
        </div>
        <div className="w-[30%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="truncate">{data.bankName}</span>
        </div>
        <div className="w-[25%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="truncate">{data.accountOwner || "-"}</span>
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className={`px-2 py-1 rounded text-xs ${getStatusColor()}`}>
            {data.status}
          </span>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
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

