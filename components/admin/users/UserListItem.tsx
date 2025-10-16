import React from "react";
import { useRouter } from "next/navigation";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";
import { BiPencil } from "react-icons/bi";
import Checkbox from "@/components/common/ui/Checkbox";

interface UserData {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  balance: number;
  createdAt: string;
}

interface UserListItemProps {
  data: UserData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onStatusChange: (userId: string, newStatus: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const UserListItem: React.FC<UserListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onStatusChange,
}) => {
  const router = useRouter();
  
  const displayName = data.firstName && data.lastName 
    ? `${data.firstName} ${data.lastName}` 
    : data.email.split('@')[0];

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/users/view/${data._id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/users/edit/${data._id}`);
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
          <div className="flex items-center">
            <FaRegUserCircle className="text-2xl mr-2 flex-shrink-0 text-dark-blue" />
            <span className="truncate">{displayName}</span>
          </div>
          <CiCircleInfo
            onClick={handleView}
            className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
          />
        </div>
        <div className="w-[25%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <MdOutlineEmail className="text-xl mr-2 flex-shrink-0" />
          <span className="truncate">{data.email}</span>
        </div>
        <div className="w-[12%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="capitalize">{data.role}</span>
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span>${data.balance?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <select
            value={data.status}
            onChange={(e) => onStatusChange(data._id, e.target.value)}
            className={`px-2 py-1 rounded-md text-sm border ${
              data.status === "Active" 
                ? "border-light-green-1 bg-light-green-2 text-green" 
                : "border-red bg-red/10 text-red"
            }`}
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="w-[13%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          {formatDate(data.createdAt)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <BiPencil
          onClick={handleEdit}
          className="cursor-pointer hover:text-dark-blue text-xl"
        />
      </div>
    </div>
  );
};

