"use client";

import { useState, useEffect, useCallback } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import api from "@/lib/api-client";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";

interface FilePreviewModalProps {
  fileName: string;
  filePath: string;
  columns: string[];
  onClose: () => void;
}

export default function FilePreviewModal({
  fileName,
  filePath,
  columns: propColumns,
  onClose,
}: FilePreviewModalProps) {
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState<string[]>(propColumns);
  const itemsPerPage = 50;

  const fetchLeadsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post("/table/file", {
        fileName: filePath,
        delimiterKey: "comma",
      });
      
      console.log("API Response:", response.data);
      console.log("Columns prop:", propColumns);
      
      // If data exists, get columns from the first row if not provided
      if (response.data && response.data.length > 0) {
        const dataColumns = Object.keys(response.data[0]);
        console.log("Data columns:", dataColumns);
        
        // Use data columns if prop columns are empty or don't match
        if (!propColumns || propColumns.length === 0 || propColumns.length !== dataColumns.length) {
          setColumns(dataColumns);
        }
      }
      
      setLeadsData(response.data);
      setFilteredLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads data:", error);
      toast.error("Failed to load leads data");
    } finally {
      setLoading(false);
    }
  }, [filePath, propColumns]);

  useEffect(() => {
    fetchLeadsData();
  }, [fetchLeadsData]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = leadsData.filter((lead) =>
        Object.values(lead).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredLeads(filtered);
      setCurrentPage(1);
    } else {
      setFilteredLeads(leadsData);
    }
  }, [searchTerm, leadsData]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray-3">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-dark">{fileName}</h2>
            <p className="text-sm text-light-dark mt-1">
              Total Leads: {filteredLeads.length.toLocaleString()}
              {searchTerm && ` (filtered from ${leadsData.length.toLocaleString()})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-gray-2 rounded-lg transition-colors"
          >
            <IoClose className="text-2xl text-dark" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-light-gray-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-dark text-xl" />
            <input
              type="text"
              placeholder="Search in all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" color="#4040BF" />
            </div>
          ) : currentLeads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-light-dark">No leads found</p>
            </div>
          ) : (
            <div className="border border-light-gray-3 rounded-lg overflow-x-auto overflow-y-auto flex-1">
              <div className="min-w-fit">
                {/* Table Header */}
                <div className="bg-[#F7F7FC] border-b-2 border-light-gray-3 flex sticky top-0 z-10">
                  {columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 font-semibold text-dark text-sm flex-shrink-0"
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      {col}
                    </div>
                  ))}
                </div>
                {/* Table Rows */}
                <div>
                  {currentLeads.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex border-b border-light-gray-3 hover:bg-light-gray-2"
                    >
                      {columns.map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className="p-3 text-dark text-sm flex-shrink-0 truncate"
                          style={{ minWidth: "200px", width: "200px" }}
                          title={row[col]}
                        >
                          {row[col] || "-"}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && currentLeads.length > 0 && (
          <div className="p-6 border-t border-light-gray-3 flex items-center justify-between">
            <div className="text-sm text-light-dark">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredLeads.length)} of{" "}
              {filteredLeads.length.toLocaleString()} leads
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-light-gray-3 rounded-lg text-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray-2"
              >
                Previous
              </button>
              <span className="text-sm text-dark">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-light-gray-3 rounded-lg text-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

