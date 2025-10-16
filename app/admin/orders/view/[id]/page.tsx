"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, ArrowLeft, Eye, Download } from "lucide-react";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import FilePreviewModal from "@/components/admin/orders/FilePreviewModal";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils/formatDate";

interface Order {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  files: Array<{
    _id: string;
    title: string;
    volume?: number;
    path?: string;
    columns?: any;
  }>;
  volume: number;
  prix: number;
  paid: string;
  paymentMethod: string;
  receipts?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderViewPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    name: string;
    path: string;
    columns: string[];
  } | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await api.get(`/admin/orders/${params.id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleBack = () => {
    router.push("/admin/orders");
  };

  const openFilePreview = (file: any) => {
    if (!file.path) {
      toast.error("File path not available");
      return;
    }

    const columns = file.columns ? Object.keys(file.columns) : [];
    
    setSelectedFile({
      id: file._id,
      name: file.title || "Untitled File",
      path: file.path,
      columns,
    });
  };

  const handleDownloadFile = (file: any) => {
    if (!file.path) {
      toast.error("File path not available");
      return;
    }

    // Open file in new tab for download
    window.open(`/${file.path}`, '_blank');
    toast.success("Download started");
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<Package />} label="Order Details" />
        <div className="flex-1 flex items-center justify-center bg-light-gray">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<Package />} label="Order Details" />
        <div className="flex-1 flex items-center justify-center bg-light-gray">
          <p className="text-light-dark">Order not found</p>
        </div>
      </div>
    );
  }

  const displayName = order.user?.firstName && order.user?.lastName
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.user?.email || "Unknown User";

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<Package />} label="Order Details" />

      <div className="flex-1 bg-light-gray overflow-auto">
        {/* Action Buttons */}
        <div className="px-8 pt-6 pb-4">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 bg-dark-blue text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>
        </div>

        {/* Order Content Container */}
        <div className="px-8 pb-8">

        {/* Order Content */}
        <div className="bg-white border-2 border-light-gray-3 rounded-lg p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-light-gray-3">
            {/* Order Icon */}
            <div className="w-24 h-24 rounded-full bg-dark-blue text-white flex items-center justify-center text-3xl font-semibold flex-shrink-0">
              <Package size={48} />
            </div>

            {/* Order Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark mb-2">Order #{order._id.slice(-8).toUpperCase()}</h2>
              <p className="text-light-dark mb-4">Full ID: {order._id}</p>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.paid === "Paid"
                    ? "bg-light-green-2 text-green border border-light-green-1"
                    : "bg-yellow-100 text-yellow-600 border border-yellow-300"
                }`}>
                  {order.paid}
                </span>
                <span className="text-3xl font-bold text-dark-blue">${order.prix.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8 pb-8 border-b border-light-gray-3">
            <h3 className="text-lg font-semibold text-dark mb-4">Customer Information</h3>
            <div className="flex items-center gap-4 p-4 bg-light-gray-2 border border-light-gray-3 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-dark-blue text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark">{displayName}</p>
                <p className="text-sm text-light-dark">{order.user?.email || "N/A"}</p>
              </div>
              <button
                onClick={() => router.push(`/admin/users/view/${order.user?._id}`)}
                className="px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8 pb-8 border-b border-light-gray-3">
            <h3 className="text-lg font-semibold text-dark mb-4">Order Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-light-dark">Total Volume</span>
                <p className="text-dark font-semibold text-lg">{order.volume.toLocaleString()} leads</p>
              </div>
              <div>
                <span className="text-sm text-light-dark">Payment Method</span>
                <p className="text-dark font-semibold">{order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-light-dark">Number of Files</span>
                <p className="text-dark font-semibold">{order.files?.length || 0} file(s)</p>
              </div>
              <div>
                <span className="text-sm text-light-dark">Order Date</span>
                <p className="text-dark font-semibold">{formatDate(order.createdAt)}</p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Files in Order */}
          {order.files && order.files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark mb-4">Files in Order</h3>
              <div className="space-y-2">
                {order.files.map((file, index) => {
                  const columns = file.columns ? Object.keys(file.columns) : [];

                  return (
                    <div
                      key={file._id}
                      className="p-4 bg-light-gray-2 border border-light-gray-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-dark">{file.title || "Untitled File"}</p>
                          <p className="text-sm text-light-dark">File ID: {file._id}</p>
                        </div>
                        {file.volume && (
                          <div className="text-center mr-4">
                            <p className="text-sm text-light-dark">Volume</p>
                            <p className="font-semibold text-dark">{file.volume.toLocaleString()} leads</p>
                          </div>
                        )}
                        {columns.length > 0 && (
                          <div className="text-center mr-4">
                            <p className="text-sm text-light-dark">Columns</p>
                            <p className="font-semibold text-dark">{columns.length}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openFilePreview(file)}
                            className="px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                          >
                            <Eye size={18} />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="px-4 py-2 bg-green text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                          >
                            <Download size={18} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Receipts */}
          {order.receipts && order.receipts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark mb-4">Payment Receipts</h3>
              <div className="space-y-2">
                {order.receipts.map((receipt, index) => (
                  <div
                    key={index}
                    className="p-4 bg-light-gray-2 border border-light-gray-3 rounded-lg flex items-center justify-between"
                  >
                    <p className="font-mono text-sm text-dark">{receipt}</p>
                    <button
                      onClick={() => window.open(receipt, '_blank')}
                      className="px-3 py-1 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-light-gray-3">
            <div>
              <span className="text-sm text-light-dark">Order Created</span>
              <p className="text-dark font-medium">{formatDate(order.createdAt)}</p>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <span className="text-sm text-light-dark">Last Updated</span>
              <p className="text-dark font-medium">{formatDate(order.updatedAt)}</p>
              <p className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          fileName={selectedFile.name}
          filePath={selectedFile.path}
          columns={selectedFile.columns}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

