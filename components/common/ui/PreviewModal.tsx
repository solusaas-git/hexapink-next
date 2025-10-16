"use client";

import React, { useEffect, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import Pagination from "./Pagination";
import api from "@/lib/api-client";
import LoadingElement from "./LoadingElement";

interface PreviewModalProps {
  onRequestClose: () => void;
  filePath: string;
  delimiter: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  filePath,
  delimiter,
  onRequestClose,
}) => {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fileData, setFileData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.post("/table/file", {
          fileName: filePath,
          delimiterKey: delimiter,
        });
        setFileData(response.data);
      } catch (error) {
        console.error("Error fetching file data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filePath, delimiter]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const filteredData = fileData.filter((item) =>
    Object.values(item).some((value: any) =>
      value.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / rowsPerPage));
  }, [filteredData, rowsPerPage]);

  const columns = fileData[0] ? Object.keys(fileData[0]).map((key) => key) : [];

  const handleClickModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onRequestClose();
    }
  };

  return (
    <div
      className="w-full h-full fixed inset-0 z-50 bg-white/80 p-24 flex items-center justify-center"
      onClick={handleClickModal}
    >
      {/* Modal Content */}
      {loading ? (
        <LoadingElement width="32" color="blue" />
      ) : (
        <div className="w-full flex flex-col gap-4 bg-light-gray shadow-xl max-w-7xl max-h-[800px] p-8 rounded-lg overflow-x-auto">
          <div className="w-full flex justify-between">
            <h2 className="pb-4 text-xl font-medium font-kanit flex items-center gap-2">
              File Data Preview (Columns: {columns.length}, Rows:{" "}
              {fileData.length})
            </h2>
            <IoCloseCircleOutline
              onClick={onRequestClose}
              className="text-2xl cursor-pointer"
            />
          </div>
          <div className="w-full flex items-center justify-between">
            <input
              value={search}
              placeholder="Search by any field"
              onChange={handleSearchChange}
              className="bg-white p-1"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              pageSizeOptions={[25, 100, 500, 1000]}
              onPageChange={(value) => setCurrentPage(value)}
              onPageSizeChange={(value) => setRowsPerPage(value)}
            />
          </div>
          <div className="w-full flex flex-col gap-4 font-raleway overflow-x-auto p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      className="h-full bg-white px-2 py-1 text-center font-bold"
                      key={col}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(startIndex, endIndex).map((row, index) => (
                  <tr key={index}>
                    {columns.map((col, colIndex) => (
                      <td
                        className={`h-full bg-white px-2 py-1 text-left ${
                          colIndex == 0 ? "rounded-l-lg" : ""
                        } ${
                          colIndex < columns.length - 1
                            ? "border-r border-dashed border-gray-300"
                            : "rounded-r-lg"
                        }`}
                        key={col}
                      >
                        <span className="text-sm line-clamp-1">{row[col]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            pageSizeOptions={[25, 100, 500, 1000]}
            onPageChange={(value) => setCurrentPage(value)}
            onPageSizeChange={(value) => setRowsPerPage(value)}
          />
        </div>
      )}
    </div>
  );
};

export default PreviewModal;
