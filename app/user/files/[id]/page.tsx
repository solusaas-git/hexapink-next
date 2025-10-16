"use client";

import NextImage from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { LiaSearchSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import UserHeader from "@/components/user/UserHeader";
import Spinner from "@/components/common/ui/Spinner";
import Pagination from "@/components/common/ui/Pagination";

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
  columns?: number;
  status: "Ready" | "Waiting";
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewFilePage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "preview">("info");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [filteredCsvData, setFilteredCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  const leadsPerPage = 50;

  const fetchFile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/file/${fileId}`);
      setFile(response.data);
    } catch (error) {
      console.error("Error fetching file:", error);
      toast.error("Failed to load file");
      router.push("/user/files");
    } finally {
      setLoading(false);
    }
  }, [fileId, router]);

  const loadHeaders = useCallback(async () => {
    if (!file?.path) return;

    try {
      setLoadingHeaders(true);
      const response = await fetch(file.path);
      const text = await response.text();
      
      // Parse CSV headers only
      const lines = text.split("\n");
      if (lines.length > 0) {
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        setCsvHeaders(headers);
      }
    } catch (error) {
      console.error("Error loading headers:", error);
    } finally {
      setLoadingHeaders(false);
    }
  }, [file?.path]);

  const loadPreview = useCallback(async () => {
    if (!file?.path || csvData.length > 0) return;

    try {
      setLoadingPreview(true);
      
      // Handle blob URLs vs local paths
      let text: string;
      if (file.path.startsWith('http')) {
        // It's a blob URL, fetch directly
        const response = await fetch(file.path);
        text = await response.text();
      } else {
        // It's a local file path, fetch from our API
        const response = await fetch(file.path);
        text = await response.text();
      }
      
      // Parse CSV
      const lines = text.split("\n");
      if (lines.length === 0) return;

      // Get headers
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      setCsvHeaders(headers);

      // Parse first 100 rows
      const rows = [];
      for (let i = 1; i < Math.min(lines.length, 101); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          rows.push(row);
        }
      }
      setCsvData(rows);
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load file preview");
    } finally {
      setLoadingPreview(false);
    }
  }, [file?.path, csvData.length]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  useEffect(() => {
    if (file && csvHeaders.length === 0) {
      loadHeaders();
    }
  }, [file, csvHeaders.length, loadHeaders]);

  useEffect(() => {
    if (activeTab === "preview" && csvData.length === 0) {
      loadPreview();
    }
  }, [activeTab, csvData.length, loadPreview]);

  const handleDownload = async (format: "csv" | "xlsx") => {
    try {
      const response = await fetch(
        `/api/file/download?fileId=${fileId}&format=${format}`
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`File downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  useEffect(() => {
    if (activeTab === "preview" && file) {
      loadPreview();
    }
  }, [activeTab, file, loadPreview]);

  // Filter data based on search term
  useEffect(() => {
    if (csvData.length === 0) {
      setFilteredCsvData([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredCsvData(csvData);
      return;
    }

    const filtered = csvData.filter((row) =>
      csvHeaders.some((header) =>
        String(row[header] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCsvData(filtered);
    setCurrentPage(1);
  }, [csvData, searchTerm, csvHeaders]);

  // Column resizing handlers
  const handleMouseDown = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column] || 200,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(100, resizing.startWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [resizing.column]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <UserHeader icon={<FileText />} label="View File" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  // Pagination calculations
  const indexOfFirstLead = (currentPage - 1) * leadsPerPage;
  const indexOfLastLead = indexOfFirstLead + leadsPerPage;
  const currentLeads = filteredCsvData.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredCsvData.length / leadsPerPage);

  return (
    <div className="h-screen flex flex-col">
      <UserHeader icon={<FileText />} label="View File" />

      <div className="flex-1 overflow-auto bg-light-gray p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button and Download Buttons */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/user/files")}
              className="flex items-center gap-2 text-dark-blue hover:text-opacity-80 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Files
            </button>

            {/* Download Buttons */}
            {file?.status === "Ready" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload("csv")}
                  className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  <Download size={18} />
                  Download CSV
                </button>
                <button
                  onClick={() => handleDownload("xlsx")}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  <Download size={18} />
                  Download XLSX
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-light-gray-3">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === "info"
                      ? "text-dark-blue border-b-2 border-dark-blue"
                      : "text-gray-500 hover:text-dark-blue"
                  }`}
                >
                  File Info
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === "preview"
                      ? "text-dark-blue border-b-2 border-dark-blue"
                      : "text-gray-500 hover:text-dark-blue"
                  }`}
                >
                  File Preview
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "info" ? (
                <div className="space-y-6">
                  {/* File Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Title
                      </label>
                      <p className="text-base font-medium text-light-dark">{file.title}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Collection
                      </label>
                      <p className="text-base font-medium text-light-dark">
                        {file.collection?.title || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Type
                      </label>
                      <p className="text-base font-medium text-light-dark">{file.type}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Status
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                          file.status === "Ready"
                            ? "bg-light-green-2 text-green"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {file.status}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Volume
                      </label>
                      <p className="text-base font-medium text-light-dark">
                        {file.volume?.toLocaleString() || 0} leads
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Columns
                      </label>
                      <p className="text-base font-medium text-light-dark">
                        {file.columns || 0} columns
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Countries
                      </label>
                      <p className="text-base font-medium text-light-dark">
                        {file.countries.join(", ")}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Created At
                      </label>
                      <p className="text-base font-medium text-light-dark">
                        {new Date(file.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Collection Image */}
                  {file.collection?.mobileImage && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Collection Image
                      </label>
                      <NextImage
                        src={
                          file.collection.mobileImage.startsWith("/") || file.collection.mobileImage.startsWith("http")
                            ? file.collection.mobileImage
                            : `/${file.collection.mobileImage}`
                        }
                        alt={file.collection.title}
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border border-light-gray-3"
                      />
                    </div>
                  )}

                  {/* Column Names */}
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-600 block mb-2">
                      Column Names ({csvHeaders.length} columns)
                    </label>
                    {loadingHeaders ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="#4040BF" />
                        <span className="text-sm text-gray-500">Loading columns...</span>
                      </div>
                    ) : csvHeaders.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {csvHeaders.map((header, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-light-gray-1 text-dark-blue text-sm font-medium rounded-lg border border-light-gray-3"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No columns available</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-light-gray-1 rounded-lg">
                    <div className="p-4 border-b border-dashed border-light-gray-1 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-dark">
                        Leads Preview ({filteredCsvData.length.toLocaleString()} {searchTerm ? "matching" : "total"})
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
                      {loadingPreview ? (
                        <div className="flex items-center justify-center py-20">
                          <Spinner size="lg" color="#4040BF" />
                        </div>
                      ) : currentLeads.length > 0 ? (
                        <>
                          <div className="space-y-3 overflow-x-auto">
                            {/* Table Header */}
                            <div className="bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x text-light-dark font-medium text-sm min-w-fit">
                              <div className="w-16 p-2 flex items-center justify-center flex-shrink-0">#</div>
                              {csvHeaders.map((column) => (
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
                                {csvHeaders.map((column) => (
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
                          <div className="flex items-center justify-center mt-6">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                              rowsPerPage={leadsPerPage}
                              pageSizeOptions={[50]}
                              onPageSizeChange={() => {}}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-20 text-gray-500">
                          {searchTerm ? "No matching leads found" : "No preview available"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

