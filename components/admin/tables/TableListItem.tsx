import React from "react";
import { useRouter } from "next/navigation";
import { PiTableLight } from "react-icons/pi";
import { CiCircleInfo } from "react-icons/ci";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import Checkbox from "@/components/common/ui/Checkbox";
import { formatDate } from "@/lib/utils/formatDate";

interface TableData {
  _id: string;
  tableName: string;
  columns: string[];
  leads: number;
  tags?: string[];
  createdAt: string;
}

interface TableListItemProps {
  data: TableData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onDelete: (tableId: string) => void;
}

export const TableListItem: React.FC<TableListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onDelete,
}) => {
  const router = useRouter();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/tables/view/${data._id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/tables/edit/${data._id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
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
        <div className="w-[30%] p-3 flex justify-between items-center">
          <div className="flex items-center">
            <PiTableLight className="text-2xl mr-2 flex-shrink-0" />
            <span className="font-semibold truncate">{data.tableName}</span>
          </div>
          <CiCircleInfo
            onClick={handleView}
            className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
          />
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span>{data.columns?.length || 0}</span>
        </div>
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span>{data.leads.toLocaleString()}</span>
        </div>
        <div className="w-[25%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <div className="flex gap-1 flex-wrap">
            {data.tags && data.tags.length > 0 ? (
              data.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-light-gray-2 border border-light-gray-3 rounded text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">-</span>
            )}
            {data.tags && data.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{data.tags.length - 3} more</span>
            )}
          </div>
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

