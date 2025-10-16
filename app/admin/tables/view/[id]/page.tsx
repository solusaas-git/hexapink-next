"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PiTableLight } from "react-icons/pi";
import { GoArrowLeft } from "react-icons/go";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import { LiaSearchSolid } from "react-icons/lia";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils/formatDate";

interface TableData {
  _id: string;
  tableName: string;
  columns: string[];
  leads: number;
  tags?: string[];
  file: string;
  delimiter: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [table, setTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"info" | "leads">("info");
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  const leadsPerPage = 50;

  const fetchTable = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<TableData>(`/admin/tables/${id}`);
      setTable(response.data);
    } catch (error) {
      console.error("Error fetching table:", error);
      toast.error("Failed to load table data.");
      router.push("/admin/tables");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  const fetchLeadsData = async (tableData: TableData) => {
    try {
      setLoadingLeads(true);
      const response = await api.post("/table/file", {
        fileName: tableData.file,
        delimiterKey: tableData.delimiter,
      });
      
      console.log(`Loaded ${response.data.length} leads from file`);
      console.log(`Expected: ${tableData.leads} leads`);
      
      if (response.data.length !== tableData.leads) {
        console.warn(`Mismatch: File has ${response.data.length} records but database shows ${tableData.leads}`);
      }
      
      setLeadsData(response.data);
      setFilteredLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads data");
    } finally {
      setLoadingLeads(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLeads(leadsData);
      setCurrentPage(1);
      return;
    }

    const filtered = leadsData.filter((lead) => {
      return Object.values(lead).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredLeads(filtered);
    setCurrentPage(1);
  }, [searchTerm, leadsData]);

  // Column resizing handlers
  const handleMouseDown = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[column] || 200;
    setResizing({ column, startX, startWidth });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(100, resizing.startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  const handleEdit = () => {
    router.push(`/admin/tables/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/tables/${id}`);
      toast.success("Table deleted successfully");
      router.push("/admin/tables");
    } catch (error: any) {
      console.error("Error deleting table:", error);
      toast.error(error.response?.data?.message || "Failed to delete table");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiTableLight />} label="Table Details" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiTableLight />} label="Table Details" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Table not found</p>
        </div>
      </div>
    );
  }

  const delimiterSymbols: { [key: string]: string } = {
    comma: ",",
    tab: "\\t",
    semicolon: ";",
    pipe: "|",
  };

  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiTableLight />} label="Table Details" />

      <div className="h-full bg-light-gray overflow-y-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-light-gray-3 bg-white">
          <div
            onClick={() => router.push("/admin/tables")}
            className="flex items-center gap-1 border border-dark hover:border-dark-blue hover:text-dark-blue rounded-full px-4 py-2 cursor-pointer"
          >
            <GoArrowLeft />
            <span>Back to Tables</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 border border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white rounded-full px-4 py-2 cursor-pointer transition-all"
            >
              <BiPencil />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 border border-red text-red hover:bg-red hover:text-white rounded-full px-4 py-2 cursor-pointer transition-all"
            >
              <BsTrash3 />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-light-gray-3 bg-white px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === "info"
                  ? "border-dark-blue text-dark-blue"
                  : "border-transparent text-light-dark hover:text-dark"
              }`}
            >
              Table Information
            </button>
            <button
              onClick={() => {
                setActiveTab("leads");
                if (leadsData.length === 0 && table) {
                  fetchLeadsData(table);
                }
              }}
              className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === "leads"
                  ? "border-dark-blue text-dark-blue"
                  : "border-transparent text-light-dark hover:text-dark"
              }`}
            >
              Leads Preview
              {leadsData.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-dark-blue text-white text-xs rounded-full">
                  {leadsData.length.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "info" ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Table Info Card */}
              <div className="bg-white border border-light-gray-1 rounded-lg">
              <div className="p-4 border-b border-dashed border-light-gray-1">
                <h3 className="font-bold text-lg text-dark">Table Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-light-dark font-medium">Table Name</label>
                    <p className="text-dark font-semibold mt-1">{table.tableName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-light-dark font-medium">Table ID</label>
                    <p className="text-dark font-mono text-sm mt-1">table_{table._id.slice(-8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-light-dark font-medium">Delimiter</label>
                    <p className="text-dark mt-1 capitalize">
                      {table.delimiter}{" "}
                      <span className="text-xs bg-light-gray-2 px-2 py-0.5 rounded font-mono border border-light-gray-3">
                        {delimiterSymbols[table.delimiter]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-light-dark font-medium">Columns</label>
                    <p className="text-dark font-semibold mt-1">{table.columns.length}</p>
                  </div>
                  <div>
                    <label className="text-sm text-light-dark font-medium">Total Leads</label>
                    <p className="text-dark font-semibold mt-1">{table.leads.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-light-dark font-medium">Created</label>
                    <p className="text-dark mt-1">{formatDate(table.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-light-dark font-medium">Last Updated</label>
                    <p className="text-dark mt-1">{formatDate(table.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {table.tags && table.tags.length > 0 && (
              <div className="bg-white border border-light-gray-1 rounded-lg">
                <div className="p-4 border-b border-dashed border-light-gray-1">
                  <h3 className="font-bold text-lg text-dark">Tags</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {table.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-dark-blue text-white rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Columns Card */}
            <div className="bg-white border border-light-gray-1 rounded-lg">
              <div className="p-4 border-b border-dashed border-light-gray-1">
                <h3 className="font-bold text-lg text-dark">Columns ({table.columns.length})</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {table.columns.map((column, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-light-gray-2 border border-light-gray-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-dark font-medium text-sm">{column}</span>
                        <span className="text-xs text-light-dark bg-white px-2 py-0.5 rounded border border-light-gray-3">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* File Info Card */}
            <div className="bg-white border border-light-gray-1 rounded-lg">
              <div className="p-4 border-b border-dashed border-light-gray-1">
                <h3 className="font-bold text-lg text-dark">File Details</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-light-dark font-medium">File Path</label>
                    <p className="text-dark font-mono text-sm mt-1 break-all bg-light-gray-2 p-2 rounded">
                      {table.file}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : (
            /* Leads Preview Tab */
            <div className="space-y-6">
            <div className="bg-white border border-light-gray-1 rounded-lg">
              <div className="p-4 border-b border-dashed border-light-gray-1 flex items-center justify-between">
                <h3 className="font-bold text-lg text-dark">
                  Leads Preview ({filteredLeads.length.toLocaleString()} {searchTerm ? "matching" : "total"})
                </h3>
                
                {/* Search */}
                <div className="flex items-center gap-2 p-2 border border-light-gray-3 rounded-lg w-80">
                  <LiaSearchSolid className="text-lg text-light-dark" />
                  <input
                    type="text"
                    placeholder="Search in leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent outline-none text-dark text-sm flex-1"
                  />
                </div>
              </div>
              
              <div className="p-6">
                {loadingLeads ? (
                  <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" color="#4040BF" />
                  </div>
                ) : currentLeads.length > 0 ? (
                  <>
                    <div className="space-y-3 overflow-x-auto">
                      {/* Table Header */}
                      <div className="bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x text-light-dark font-medium text-sm min-w-fit">
                        <div className="w-16 p-2 flex items-center justify-center flex-shrink-0">#</div>
                        {table.columns.map((column) => (
                          <div
                            key={column}
                            className="relative p-2 flex items-center truncate"
                            style={{ 
                              width: columnWidths[column] || 200,
                              minWidth: 100,
                              flexShrink: 0,
                            }}
                            title={column}
                          >
                            {column}
                            {/* Resize Handle */}
                            <div
                              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-dark-blue transition-colors"
                              onMouseDown={(e) => handleMouseDown(column, e)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Table Rows */}
                      {currentLeads.map((lead, index) => (
                        <div
                          key={index}
                          className="bg-[#F7F7FC] flex border border-light-gray-3 rounded-lg text-light-dark text-sm divide-x min-w-fit"
                        >
                          <div className="w-16 p-3 flex items-center justify-center text-light-dark flex-shrink-0">
                            {indexOfFirstLead + index + 1}
                          </div>
                          {table.columns.map((column) => (
                            <div
                              key={column}
                              className="p-3 flex items-center truncate"
                              style={{ 
                                width: columnWidths[column] || 200,
                                minWidth: 100,
                                flexShrink: 0,
                              }}
                              title={lead[column] || "-"}
                            >
                              {lead[column] || "-"}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-light-dark">
                          Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-light-gray-3 rounded text-sm hover:bg-light-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-dark">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-light-gray-3 rounded text-sm hover:bg-light-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    {searchTerm ? "No leads match your search" : "No leads data available"}
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

