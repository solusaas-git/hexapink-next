"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { LiaSearchSolid } from "react-icons/lia";
import { FaSquarePlus } from "react-icons/fa6";
import { CiFilter } from "react-icons/ci";
import Spinner from "@/components/common/ui/Spinner";

interface TableItem {
  _id: string;
  tableName: string;
  columns: string[];
  tags?: string[];
  leads?: number;
  createdAt?: string;
}

interface TableSelectionModalProps {
  tables: TableItem[];
  attachedTableIds: string[];
  loading: boolean;
  onClose: () => void;
  onAttach: (tableId: string) => void;
  disabled?: boolean;
}

export default function TableSelectionModal({
  tables,
  attachedTableIds,
  loading,
  onClose,
  onAttach,
  disabled,
}: TableSelectionModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTables, setFilteredTables] = useState<TableItem[]>(tables);

  // Get all unique tags from tables
  const allTags = Array.from(
    new Set(tables.flatMap((table) => table.tags || []))
  );

  useEffect(() => {
    let filtered = tables;

    // Filter by search
    if (search) {
      filtered = filtered.filter((table) =>
        table.tableName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((table) =>
        selectedTags.some((tag) => table.tags?.includes(tag))
      );
    }

    // Filter by date
    if (dateFilter !== "all" && filtered[0]?.createdAt) {
      const now = new Date();
      filtered = filtered.filter((table) => {
        if (!table.createdAt) return true;
        const tableDate = new Date(table.createdAt);

        if (dateFilter === "custom") {
          // Custom date range filter
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            return tableDate >= start && tableDate <= end;
          } else if (startDate) {
            const start = new Date(startDate);
            return tableDate >= start;
          } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return tableDate <= end;
          }
          return true;
        } else {
          // Quick filter
          const diffTime = now.getTime() - tableDate.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);

          switch (dateFilter) {
            case "today":
              return diffDays < 1;
            case "week":
              return diffDays < 7;
            case "month":
              return diffDays < 30;
            default:
              return true;
          }
        }
      });
    }

    setFilteredTables(filtered);
  }, [search, selectedTags, dateFilter, startDate, endDate, tables]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray-1">
          <h2 className="text-xl font-bold text-dark">Select Tables</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-dark transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-light-gray-1 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4 p-2 border border-light-gray-3 rounded-lg">
              <LiaSearchSolid className="text-2xl text-gray-400" />
              <input
                type="text"
                placeholder="Search tables by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-light-gray-3 rounded-lg hover:border-dark-blue"
            >
              <CiFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-light-gray rounded-lg">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">Created Date</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {["all", "today", "week", "month", "custom"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setDateFilter(filter as any);
                        if (filter !== "custom") {
                          setStartDate("");
                          setEndDate("");
                        }
                      }}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        dateFilter === filter
                          ? "border-dark-blue bg-dark-blue text-white"
                          : "border-light-gray-3 hover:border-dark-blue"
                      }`}
                    >
                      {filter === "all" ? "All Time" : 
                       filter === "today" ? "Today" : 
                       filter === "week" ? "This Week" : 
                       filter === "month" ? "This Month" : 
                       "Custom Range"}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Range Inputs */}
                {dateFilter === "custom" && (
                  <div className="mt-3 flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                        className="w-full px-3 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full border text-sm ${
                          selectedTags.includes(tag)
                            ? "border-dark-blue bg-dark-blue text-white"
                            : "border-light-gray-3 hover:border-dark-blue"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" color="#4040BF" />
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tables found matching your criteria
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTables.map((table) => {
                const isAttached = attachedTableIds.includes(table._id);
                return (
                  <div
                    key={table._id}
                    className={`border rounded-lg p-4 ${
                      isAttached
                        ? "border-light-gray-3 bg-light-gray opacity-60"
                        : "border-light-gray-3 hover:border-dark-blue"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-dark">{table.tableName}</h3>
                          <span className="text-xs bg-light-gray-2 px-2 py-1 rounded">
                            Table-{table._id.slice(-5)}
                          </span>
                          {isAttached && (
                            <span className="text-xs bg-green text-white px-2 py-1 rounded">
                              Attached
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{table.columns?.length || 0} columns</span>
                          <span>{table.leads || 0} leads</span>
                          {table.createdAt && (
                            <span>Created: {formatDate(table.createdAt)}</span>
                          )}
                        </div>
                        {table.tags && table.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {table.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-light-gray-1 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => !isAttached && onAttach(table._id)}
                        disabled={disabled || isAttached}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isAttached
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-dark-blue text-white hover:bg-opacity-90"
                        }`}
                      >
                        <FaSquarePlus />
                        <span>{isAttached ? "Attached" : "Attach"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-light-gray-1">
          <div className="text-sm text-gray-600">
            Showing {filteredTables.length} of {tables.length} tables
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-light-gray-3 rounded-lg hover:bg-light-gray"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

