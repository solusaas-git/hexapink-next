"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { Package, Clock, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import Spinner from "@/components/common/ui/Spinner";
import UserHeader from "@/components/user/UserHeader";
import Pagination from "@/components/common/ui/Pagination";
import { formatDate } from "@/lib/utils/formatDate";

interface Collection {
  id: string;
  title: string;
  image?: string;
  mobileImage?: string;
}

interface Order {
  _id: string;
  files: any[];
  volume: number;
  collections: Collection[];
  collectionName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/order/user`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, statusFilter, currentPage, itemsPerPage]);

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All") return true;
    return order.status === statusFilter;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      <UserHeader icon={<Package />} label="My Orders" />

      <div className="flex-1 overflow-auto bg-light-gray">
        {/* Create New Order Button */}
        <div className="px-8 py-4 flex justify-center border-b border-light-gray-1">
          <button
            onClick={() => router.push("/user/files/new")}
            className="w-full max-w-2xl bg-white border-2 border-dashed border-green rounded-lg p-4 flex items-center justify-center gap-2 text-green hover:border-green hover:bg-light-green-2 transition-colors cursor-pointer"
          >
            <Package className="text-2xl" />
            <span className="font-semibold">Create New Order</span>
          </button>
        </div>

        {/* Filter and Results */}
        <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
          <div className="ml-auto flex items-center gap-4">
            {orders.length > 0 && (
              <span>{filteredOrders.length} Results</span>
            )}
            <div className="flex gap-2">
              {["All", "Paid", "Unpaid"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setStatusFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all border ${
                    statusFilter === filter
                      ? "bg-pink text-white border-pink"
                      : "bg-white text-gray-600 border-light-gray-3 hover:border-pink"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" color="#4040BF" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border-2 border-light-gray-3 rounded-lg p-16 text-center">
            <Package size={64} className="mx-auto mb-4 text-light-gray-3" />
            <h3 className="text-xl font-bold text-dark mb-2">No Orders Found</h3>
            <p className="text-light-dark mb-6">
              {statusFilter === "All"
                ? "You haven't placed any orders yet."
                : `No ${statusFilter.toLowerCase()} orders found.`}
            </p>
            <button
              onClick={() => router.push("/user/files/new")}
              className="flex items-center gap-2 px-6 py-3 bg-green text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold shadow-sm"
            >
              <Package size={20} />
              Create New Order
            </button>
            </div>
          ) : (
            <div className="space-y-3">
            {/* Table Header */}
            <div className="bg-white border-2 border-light-gray-3 rounded-xl flex items-center text-light-dark font-bold text-xs uppercase tracking-wide shadow-sm">
              <div className="w-[12%] p-4">Order ID</div>
              <div className="w-[30%] p-4 border-l-2 border-light-gray-3">Collection</div>
              <div className="w-[10%] p-4 border-l-2 border-light-gray-3">Files</div>
              <div className="w-[15%] p-4 border-l-2 border-light-gray-3">Volume</div>
              <div className="w-[12%] p-4 border-l-2 border-light-gray-3">Amount</div>
              <div className="w-[10%] p-4 border-l-2 border-light-gray-3">Status</div>
              <div className="w-[11%] p-4 border-l-2 border-light-gray-3">Date</div>
            </div>

            {/* Table Rows */}
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => router.push(`/user/orders/${order._id}`)}
                className="bg-white border-2 border-light-gray-3 rounded-xl flex items-center text-light-dark text-sm hover:border-dark-blue hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="w-[12%] p-4 flex items-center gap-2">
                  <div className="w-10 h-10 bg-light-pink rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-pink" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-dark block truncate">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="text-xs text-light-dark">Order</span>
                  </div>
                </div>
                <div className="w-[30%] p-4 border-l-2 border-dashed border-light-gray-3">
                  <div className="flex items-center gap-3">
                    {order.collections && order.collections.length > 0 ? (
                      <>
                        {/* Collection Images */}
                        <div className="flex -space-x-2">
                          {order.collections.slice(0, 3).map((collection, idx) => (
                            <div
                              key={collection.id}
                              className="w-10 h-10 rounded-lg border-2 border-white bg-[#F0F0FA] flex items-center justify-center overflow-hidden flex-shrink-0"
                              style={{ zIndex: 10 - idx }}
                            >
                              {collection.mobileImage || collection.image ? (
                                <NextImage
                                  src={
                                    (collection.mobileImage || collection.image)?.startsWith('/')
                                      ? (collection.mobileImage || collection.image)!
                                      : `/${collection.mobileImage || collection.image}`
                                  }
                                  alt={collection.title}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={16} className="text-light-dark" />
                              )}
                            </div>
                          ))}
                          {order.collections.length > 3 && (
                            <div className="w-10 h-10 rounded-lg border-2 border-white bg-dark-blue flex items-center justify-center text-white text-xs font-bold">
                              +{order.collections.length - 3}
                            </div>
                          )}
                        </div>
                        {/* Collection Names */}
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-dark block truncate" title={order.collectionName}>
                            {order.collectionName}
                          </span>
                          <span className="text-xs text-light-dark">
                            {order.collections.length} collection{order.collections.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-light-dark">N/A</span>
                    )}
                  </div>
                </div>
                <div className="w-[10%] p-4 border-l-2 border-dashed border-light-gray-3">
                  <div className="text-center">
                    <div className="font-bold text-dark text-lg">{order.files?.length || 0}</div>
                    <div className="text-xs text-light-dark">file{order.files?.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="w-[15%] p-4 border-l-2 border-dashed border-light-gray-3">
                  <div className="text-center">
                    <div className="font-bold text-dark text-lg">{order.volume?.toLocaleString() || 0}</div>
                    <div className="text-xs text-light-dark">leads</div>
                  </div>
                </div>
                <div className="w-[12%] p-4 border-l-2 border-dashed border-light-gray-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign size={16} className="text-green" />
                      <span className="font-bold text-dark text-lg">{order.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="text-xs text-light-dark">Total</div>
                  </div>
                </div>
                <div className="w-[10%] p-4 border-l-2 border-dashed border-light-gray-3 flex items-center justify-center">
                    <span
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 inline-block ${
                      order.status === "Paid"
                        ? "bg-light-green-2 border-green text-green"
                        : "bg-yellow-50 border-yellow-400 text-yellow-700"
                    }`}
                    >
                      {order.status}
                    </span>
                </div>
                <div className="w-[11%] p-4 border-l-2 border-dashed border-light-gray-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="flex-shrink-0 text-light-dark" />
                    <span className="text-xs text-dark font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  rowsPerPage={itemsPerPage}
                  pageSizeOptions={pageSizeOptions}
                  onPageSizeChange={setItemsPerPage}
                />
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
