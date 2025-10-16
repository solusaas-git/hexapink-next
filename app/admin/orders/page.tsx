"use client";

import { useState, useEffect, useCallback } from "react";
import { CiFilter } from "react-icons/ci";
import { PiPackage } from "react-icons/pi";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Pagination from "@/components/common/ui/Pagination";
import Spinner from "@/components/common/ui/Spinner";
import OrderListHeader from "@/components/admin/orders/OrderListHeader";
import { OrderListItem } from "@/components/admin/orders/OrderListItem";

interface Order {
  _id: string;
  userId: string;
  userEmail: string;
  filesCount: number;
  volume: number;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders");
      setFilteredOrders(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleCheckboxChange = (index: string) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.includes(index)
        ? prevSelectedFiles.filter((fileIndex) => fileIndex !== index)
        : [...prevSelectedFiles, index]
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiPackage />} label="Orders" />

      <div className="h-full bg-light-gray border-b border-light-gray-1 flex">
        <div className="flex flex-col flex-1 border-r border-light-gray-1">
          <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
            {selectedFiles.length > 0 && (
              <span>{selectedFiles.length} Selected</span>
            )}
            <div className="ml-auto flex items-center divide-x">
              <div className="pr-4 flex items-center gap-2">
                {filteredOrders.length > 0 && (
                  <span>{filteredOrders.length} Results</span>
                )}
                <button className="flex items-center border border-light-gray-3 rounded-md px-2 py-1 text-dark cursor-pointer">
                  <CiFilter />
                  <span>Filter</span>
                </button>
              </div>
              <div className="pl-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  rowsPerPage={itemsPerPage}
                  pageSizeOptions={pageSizeOptions}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-4">
            <OrderListHeader />
            {loading ? (
              <div className="w-full h-full flex items-center justify-center py-20">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : (
              currentFiles.map((item) => (
                <OrderListItem
                  data={item}
                  key={item._id}
                  index={item._id}
                  isSelected={selectedFiles.includes(item._id)}
                  onCheckboxChange={handleCheckboxChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
