import NextImage from "next/image";
import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/common/ui/Checkbox";
import { formatDate } from "@/lib/utils/formatDate";

interface FileData {
  _id: string;
  title: string;
  type: string;
  countries: string[];
  collection: {
    _id: string;
    title: string;
    mobileImage?: string;
    image?: string;
  } | null;
  volume?: number;
  columns?: any;
  status: "Ready" | "Waiting";
  path?: string;
  createdAt: string;
  updatedAt: string;
}

interface FileListItemProps {
  data: FileData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onDownload: (file: FileData, format: "csv" | "xlsx") => void;
}

export default function FileListItem({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onDownload,
}: FileListItemProps) {
  const router = useRouter();

  const getStatusColor = () => {
    return data.status === "Ready"
      ? "bg-light-green-2 text-green"
      : "bg-yellow-100 text-yellow-600";
  };

  const handleViewFile = () => {
    router.push(`/user/files/${data._id}`);
  };

  return (
    <div className="w-full flex items-center gap-2 text-light-dark">
      <Checkbox checked={isSelected} onChange={() => onCheckboxChange(index)} />
      <div
        className={`w-full bg-[#F7F7FC] flex border ${
          isSelected ? "border-dark-blue" : "border-light-gray-3"
        } rounded-lg hover:border-dark-blue transition-colors`}
      >
        {/* Image */}
        <div className="w-[8%] p-3 flex items-center justify-center">
          {data.collection?.mobileImage ? (
            <NextImage
              src={data.collection.mobileImage.startsWith('/') ? data.collection.mobileImage : `/${data.collection.mobileImage}`}
              alt={data.collection.title}
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-lg border border-light-gray-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <FileText className="text-pink hidden" size={24} />
        </div>

        {/* Title */}
        <div className="w-[22%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
          <span className="font-semibold truncate flex-1">{data.title}</span>
          <button
            onClick={handleViewFile}
            className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded hover:bg-opacity-90 transition-all"
            title="View File"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Collection */}
        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="text-sm truncate">{data.collection?.title || "N/A"}</span>
        </div>

        {/* Volume */}
        <div className="w-[12%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="font-medium">{data.volume?.toLocaleString() || 0}</span>
        </div>

        {/* Columns */}
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="text-sm">{typeof data.columns === 'number' ? data.columns : (data.columns ? Object.keys(data.columns).length : 0)}</span>
        </div>

        {/* Status */}
        <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
            {data.status}
          </span>
        </div>

        {/* Created Date */}
        <div className="w-[13%] p-3 flex items-center border-l border-dashed border-light-gray-3">
          <span className="text-sm">{formatDate(data.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="w-[10%] p-3 flex items-center gap-1 border-l border-dashed border-light-gray-3">
          {data.status === "Ready" && data.path ? (
            <>
              <button
                onClick={() => onDownload(data, "csv")}
                className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-1 bg-green text-white rounded hover:bg-opacity-90 transition-all text-[10px] font-medium"
                title="Download CSV"
              >
                <Download size={10} />
                CSV
              </button>
              <button
                onClick={() => onDownload(data, "xlsx")}
                className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-1 bg-dark-blue text-white rounded hover:bg-opacity-90 transition-all text-[10px] font-medium"
                title="Download Excel"
              >
                <Download size={10} />
                XLSX
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Processing...</span>
          )}
        </div>
      </div>
    </div>
  );
}

