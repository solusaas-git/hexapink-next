"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PiTableLight } from "react-icons/pi";
import { CiFilter } from "react-icons/ci";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import Pagination from "@/components/common/ui/Pagination";
import TableListHeader from "@/components/admin/tables/TableListHeader";
import { TableListItem } from "@/components/admin/tables/TableListItem";
import { toast } from "react-toastify";

interface Table {
  _id: string;
  tableName: string;
  columns: string[];
  leads: number;
  tags?: string[];
  createdAt: string;
}

export default function AdminTablesPage() {
  const router = useRouter();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/tables");
      setFilteredTables(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (index: string) => {
    setSelectedTables((prevSelectedTables) =>
      prevSelectedTables.includes(index)
        ? prevSelectedTables.filter((tableIndex) => tableIndex !== index)
        : [...prevSelectedTables, index]
    );
  };

  const handleDelete = async (tableId: string) => {
    try {
      await api.delete(`/admin/tables/${tableId}`);
      toast.success("Table deleted successfully");
      fetchTables(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting table:", error);
      toast.error(error.response?.data?.message || "Failed to delete table");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTables = filteredTables.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiTableLight />} label="Tables" />

      <div className="h-full bg-light-gray border-b border-light-gray-1 flex">
        <div className="flex flex-col flex-1 border-r border-light-gray-1">
          <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
            {selectedTables.length > 0 && (
              <span>{selectedTables.length} Selected</span>
            )}
            <div className="ml-auto flex items-center divide-x">
              <div className="pr-4 flex items-center gap-2">
                {filteredTables.length > 0 && (
                  <span>{filteredTables.length} Results</span>
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
            {/* Create New Table Button */}
            <div className="relative border-2 border-dashed border-light-gray-3 rounded-lg p-4 flex items-center justify-between gap-2 cursor-pointer font-redacted-script text-light-gray-3">
              <div className="flex flex-1 items-center opacity-30">
                <PiTableLight className="text-2xl mr-2" />
                <span className="flex-1 text-left">Table-12312</span>
                <span className="bg-light-gray-2 text-xs px-2 py-1 rounded">Table-12345</span>
              </div>
              <button
                onClick={() => router.push("/admin/tables/new")}
                className="absolute left-1/2 transform -translate-x-1/2 rounded-full h-10 px-6 py-2 flex items-center gap-2 bg-dark-blue text-white hover:bg-opacity-90 transition-all font-raleway"
              >
                <span className="text-2xl">+</span>
                <span className="text-sm">Create New Table</span>
              </button>
            </div>

            <TableListHeader />
            {loading ? (
              <div className="w-full h-full flex items-center justify-center py-20">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : (
                  currentTables.map((table) => (
                    <TableListItem
                      data={table}
                      key={table._id}
                      index={table._id}
                      isSelected={selectedTables.includes(table._id)}
                      onCheckboxChange={handleCheckboxChange}
                      onDelete={handleDelete}
                    />
                  ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
