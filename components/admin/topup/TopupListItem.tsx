import NextImage from "next/image";
import React, { useState } from "react";
import { PiArrowFatUpLight } from "react-icons/pi";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";
import { Eye } from "lucide-react";
import Checkbox from "@/components/common/ui/Checkbox";
import { formatDate } from "@/lib/utils/formatDate";

interface TopupData {
  _id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  receipts?: string[];
  createdAt: string;
}

interface TopupListItemProps {
  data: TopupData;
  index: string;
  isSelected: boolean;
  onCheckboxChange: (index: string) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const TopupListItem: React.FC<TopupListItemProps> = ({
  data,
  index,
  isSelected,
  onCheckboxChange,
  onApprove,
  onReject,
}) => {
  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to approve this top-up request?")) {
      onApprove(data._id);
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to reject this top-up request?")) {
      onReject(data._id);
    }
  };

  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case "Completed":
        return "bg-light-green-2 text-green";
      case "Free":
        return "bg-red-100 text-red-600";
      case "Waiting":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      <div className="w-full flex items-center gap-2 text-light-dark">
        <Checkbox checked={isSelected} onChange={() => onCheckboxChange(index)} />
        <div
          className={`w-full bg-[#F7F7FC] flex border ${
            isSelected ? "border-dark-blue" : "border-light-gray-3"
          } rounded-lg`}
        >
          <div className="w-[20%] p-3 flex items-center">
            <PiArrowFatUpLight className="text-2xl mr-2 flex-shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">{data.userName || "N/A"}</span>
              <span className="text-xs text-gray-500 truncate">{data.userEmail}</span>
            </div>
          </div>
          <div className="w-[12%] p-3 flex items-center border-l border-dashed border-light-gray-3">
            <span className="font-bold text-dark-blue">${data.amount.toFixed(2)}</span>
          </div>
          <div className="w-[13%] p-3 flex items-center border-l border-dashed border-light-gray-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
              {data.status}
            </span>
          </div>
          <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
            <span className="text-sm">{data.paymentMethod || "N/A"}</span>
          </div>
          <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
            {formatDate(data.createdAt)}
          </div>
          <div className="w-[25%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
            {data.status === "Waiting" ? (
              <>
                {data.receipts && data.receipts.length > 0 && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-pink text-white rounded hover:bg-opacity-90 transition-all text-sm"
                  >
                    <Eye size={14} />
                    Receipt
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green text-white rounded hover:bg-opacity-90 transition-all text-xs font-medium"
                >
                  <BiCheckCircle className="text-base" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red text-white rounded hover:bg-opacity-90 transition-all text-xs font-medium"
                >
                  <BiXCircle className="text-base" />
                  Reject
                </button>
              </>
            ) : data.status === "Completed" ? (
              <>
                {data.receipts && data.receipts.length > 0 && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-pink text-white rounded hover:bg-opacity-90 transition-all text-sm"
                  >
                    <Eye size={14} />
                    Receipt
                  </button>
                )}
                <span className="text-sm text-green font-medium">✓ Approved</span>
              </>
            ) : data.status === "Free" ? (
              <span className="text-sm text-red-600 font-medium">✗ Rejected</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-dark-blue">Payment Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {data.receipts?.map((receipt, index) => {
                const receiptPath = receipt.startsWith('/') ? receipt : `/${receipt}`;
                const isPdf = receipt.toLowerCase().endsWith('.pdf');

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Receipt {index + 1} {isPdf && <span className="text-xs text-gray-500">(PDF)</span>}
                      </p>
                      <a
                        href={receiptPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pink hover:underline font-medium"
                      >
                        Open in new tab →
                      </a>
                    </div>
                    
                    {isPdf ? (
                      <div className="w-full">
                        <iframe
                          src={receiptPath}
                          className="w-full h-[600px] rounded border"
                          title={`Receipt ${index + 1}`}
                        />
                      </div>
                    ) : (
                      <>
                        <NextImage
                          src={receiptPath}
                          alt={`Receipt ${index + 1}`}
                          width={300}
                          height={200}
                          className="max-w-full h-auto rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-center text-gray-500 py-8">
                          <p className="mb-2">Unable to load image</p>
                          <a
                            href={receiptPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink hover:underline font-medium"
                          >
                            Open in new tab →
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

