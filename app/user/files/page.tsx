"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { Database, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import Spinner from "@/components/common/ui/Spinner";
import UserHeader from "@/components/user/UserHeader";
import Pagination from "@/components/common/ui/Pagination";
import FileListHeader from "@/components/user/files/FileListHeader";
import FileListItem from "@/components/user/files/FileListItem";

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

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/file?status=${statusFilter}`);
      setFiles(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, itemsPerPage]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, currentPage]);

  const handleCheckboxChange = (index: string) => {
    setSelectedFiles((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleDownload = async (file: FileData, format: "csv" | "xlsx") => {
    try {
      if (!file._id) {
        toast.error("File ID not available");
        return;
      }

      // Use the download API endpoint
      const downloadUrl = `/api/file/download?fileId=${file._id}&format=${format}`;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${file.title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${file.title}.${format}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  // Paginated files
  const currentFiles = files.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full flex flex-col">
      <UserHeader icon={<Database />} label="Files" />

      <div className="h-full bg-light-gray border-b border-light-gray-1 flex">
        <div className="flex flex-col flex-1 border-r border-light-gray-1">
          {/* Create New Order Button */}
          <div className="px-8 py-4 flex justify-center border-b border-light-gray-1">
            <button
              onClick={() => router.push("/user/files/new")}
              className="w-full max-w-2xl bg-white border-2 border-dashed border-green rounded-lg p-4 flex items-center justify-center gap-2 text-green hover:border-green hover:bg-light-green-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="text-2xl" />
              <span className="font-semibold">Create New Order</span>
            </button>
          </div>

          {/* Filter and Pagination */}
          <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
            {selectedFiles.length > 0 && (
              <span>{selectedFiles.length} Selected</span>
            )}
            <div className="ml-auto flex items-center divide-x">
              <div className="pr-4 flex items-center gap-2">
                {files.length > 0 && (
                  <span>{files.length} Results</span>
                )}
                <div className="flex gap-2">
                  {["All", "Ready", "Waiting"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
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
            <FileListHeader />
            {loading ? (
              <div className="w-full h-full flex items-center justify-center py-20">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Database className="text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg mb-2">No files found</p>
                <p className="text-gray-400 text-sm mb-6">
                  Purchase data from collections to see them here
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-pink text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all font-medium"
                >
                  Browse Collections
                </button>
              </div>
            ) : (
              currentFiles.map((file) => (
                <FileListItem
                  key={file._id}
                  data={file}
                  index={file._id}
                  isSelected={selectedFiles.includes(file._id)}
                  onCheckboxChange={handleCheckboxChange}
                  onDownload={handleDownload}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
