"use client";

import React from "react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onPageSizeChange(Number(event.target.value));
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className={`${currentPage === 1 ? "border-none" : ""} cursor-pointer`}
      >
        <GoArrowLeft />
      </button>
      <span>
        {currentPage} of {totalPages} Pages
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`${
          currentPage === totalPages ? "border-none" : ""
        } cursor-pointer`}
      >
        <GoArrowRight />
      </button>
      <select
        id="page-size"
        value={rowsPerPage}
        onChange={handlePageSizeChange}
        className="bg-white border border-gray-300 rounded-md p-1"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size} per page
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
