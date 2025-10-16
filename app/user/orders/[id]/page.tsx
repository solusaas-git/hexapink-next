"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, DollarSign, Clock, Download, Eye, FileText } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import UserHeader from "@/components/user/UserHeader";
import Spinner from "@/components/common/ui/Spinner";
import { formatDate } from "@/lib/utils/formatDate";

interface Collection {
  _id: string;
  title: string;
  image?: string;
  mobileImage?: string;
}

interface FileData {
  _id: string;
  title: string;
  type: string;
  countries: string[];
  collectionId: Collection;
  volume?: number;
  columns?: number;
  status: "Ready" | "Waiting";
  path?: string;
  createdAt: string;
}

interface OrderDetail {
  _id: string;
  files: FileData[];
  volume: number;
  prix: number;
  paid: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/order/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      router.push("/user/orders");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleDownloadFile = async (fileId: string, fileName: string, format: "csv" | "xlsx") => {
    try {
      const response = await fetch(`/api/file/download?fileId=${fileId}&format=${format}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Downloading ${fileName}.${format}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <UserHeader icon={<Package />} label="View Order" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex flex-col">
        <UserHeader icon={<Package />} label="View Order" />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Package size={64} className="text-light-gray-3 mb-4" />
          <h3 className="text-xl font-bold text-dark mb-2">Order Not Found</h3>
          <p className="text-light-dark mb-6">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/user/orders")}
            className="px-6 py-3 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Group files by collection
  const filesByCollection = order.files.reduce((acc, file) => {
    const collectionTitle = file.collectionId?.title || "Unknown";
    if (!acc[collectionTitle]) {
      acc[collectionTitle] = [];
    }
    acc[collectionTitle].push(file);
    return acc;
  }, {} as Record<string, FileData[]>);

  return (
    <div className="h-full flex flex-col">
      <UserHeader icon={<Package />} label="Order Details" />

      <div className="flex-1 overflow-auto bg-light-gray p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/user/orders")}
            className="flex items-center gap-2 text-dark-blue hover:text-opacity-80 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="bg-white border-2 border-light-gray-3 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-light-pink rounded-xl flex items-center justify-center">
                  <Package size={28} className="text-pink" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark">Order #{order._id.slice(-8).toUpperCase()}</h1>
                  <p className="text-sm text-light-dark flex items-center gap-2">
                    <Clock size={14} />
                    Created on {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${
                  order.paid === "Paid"
                    ? "bg-light-green-2 border-green text-green"
                    : "bg-yellow-50 border-yellow-400 text-yellow-700"
                }`}
              >
                {order.paid}
              </span>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t-2 border-light-gray-3">
              <div className="text-center">
                <div className="text-xs text-light-dark mb-1">Total Files</div>
                <div className="text-2xl font-bold text-dark">{order.files.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-light-dark mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-dark">{order.volume.toLocaleString()}</div>
                <div className="text-xs text-light-dark">leads</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-light-dark mb-1">Total Amount</div>
                <div className="flex items-center justify-center gap-1">
                  <DollarSign size={20} className="text-green" />
                  <div className="text-2xl font-bold text-dark">{order.prix.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-light-dark mb-1">Payment Method</div>
                <div className="text-lg font-semibold text-dark">{order.paymentMethod}</div>
              </div>
            </div>
          </div>

          {/* Files by Collection */}
          <div className="space-y-6">
            {Object.entries(filesByCollection).map(([collectionTitle, files]) => (
              <div key={collectionTitle} className="bg-white border-2 border-light-gray-3 rounded-xl shadow-sm overflow-hidden">
                {/* Collection Header */}
                <div className="bg-gradient-to-r from-dark-blue to-purple p-4 flex items-center gap-3">
                  {files[0]?.collectionId?.mobileImage || files[0]?.collectionId?.image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white flex-shrink-0">
                      <NextImage
                        src={
                          (files[0].collectionId.mobileImage || files[0].collectionId.image)?.startsWith('/')
                            ? (files[0].collectionId.mobileImage || files[0].collectionId.image)!
                            : `/${files[0].collectionId.mobileImage || files[0].collectionId.image}`
                        }
                        alt={collectionTitle}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{collectionTitle}</h2>
                    <p className="text-sm text-white text-opacity-90">{files.length} file{files.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Files List */}
                <div className="divide-y-2 divide-light-gray-3">
                  {files.map((file) => (
                    <div key={file._id} className="p-4 hover:bg-light-gray-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-light-gray-2 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={20} className="text-dark-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-dark truncate" title={file.title}>
                              {file.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-light-dark">
                              <span>{file.type}</span>
                              <span>•</span>
                              <span>{file.countries.join(", ")}</span>
                              <span>•</span>
                              <span>{file.volume?.toLocaleString() || 0} leads</span>
                              <span>•</span>
                              <span>{file.columns || 0} columns</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              file.status === "Ready"
                                ? "bg-light-green-2 border-light-green-1 text-green"
                                : "bg-yellow-50 border-yellow-400 text-yellow-700"
                            }`}
                          >
                            {file.status}
                          </span>

                          {/* Action Buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/user/files/${file._id}`);
                            }}
                            className="p-2 rounded-lg hover:bg-opacity-90 transition-all"
                            style={{ backgroundColor: '#9333EA' }}
                            title="View File"
                          >
                            <Eye size={16} style={{ color: '#FFFFFF' }} />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file._id, file.title, "csv")}
                            disabled={file.status !== "Ready"}
                            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              file.status === "Ready"
                                ? "bg-green text-white hover:opacity-90"
                                : "bg-light-gray-2 text-light-gray-3 cursor-not-allowed"
                            }`}
                            title="Download CSV"
                          >
                            <Download size={14} />
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file._id, file.title, "xlsx")}
                            disabled={file.status !== "Ready"}
                            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              file.status === "Ready"
                                ? "bg-dark-blue text-white hover:opacity-90"
                                : "bg-light-gray-2 text-light-gray-3 cursor-not-allowed"
                            }`}
                            title="Download XLSX"
                          >
                            <Download size={14} />
                            <span>XLSX</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

