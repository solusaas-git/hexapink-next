"use client";

import { useState, useEffect } from "react";
import { FaRegFolderOpen } from "react-icons/fa";
import { FaSquarePlus } from "react-icons/fa6";
import { PiTableLight } from "react-icons/pi";
import { IoMdRadioButtonOn } from "react-icons/io";
import { BsTrash3 } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import api from "@/lib/api-client";
import TableSelectionModal from "./TableSelectionModal";

interface Column {
  id: number;
  name: string;
  type: string;
  showToClient: boolean;
  isAdditionalFee: boolean;
  additionalFee?: number;
  tableColumns?: {
    tableId: string;
    tableName: string;
    tableColumn: string;
  }[];
  optional?: boolean;
  stepName?: string;
}

interface TableItem {
  _id: string;
  tableName: string;
  columns: string[];
}

interface ColumnMappingProps {
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  disabled?: boolean;
}

export default function ColumnMapping({
  columns,
  setColumns,
  disabled,
}: ColumnMappingProps) {
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [attachedTables, setAttachedTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (columns.length && tables.length) {
      const attached = tables.filter((table) =>
        columns.some((column) =>
          column.tableColumns?.some((tc) => tc.tableId === table._id)
        )
      );
      setAttachedTables(attached);
    }
  }, [tables, columns]);


  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachTable = (id: string) => {
    if (!attachedTables.some((t) => t._id === id)) {
      const table = tables.find((t) => t._id === id);
      if (table) {
        setAttachedTables([...attachedTables, table]);
        setSelectedTable(table);
      }
    }
  };

  const handleDetachTable = (id: string) => {
    const updatedTables = attachedTables.filter((table) => table._id !== id);
    setAttachedTables(updatedTables);
    if (selectedTable?._id === id) {
      setSelectedTable(null);
    }
  };

  const handleMapColumn = (columnId: number, tableColumn: string) => {
    if (!selectedTable) return;

    const updatedColumns = columns.map((col) => {
      if (col.id === columnId) {
        const existingMapping = col.tableColumns?.find(
          (tc) => tc.tableId === selectedTable._id
        );

        if (existingMapping) {
          return {
            ...col,
            tableColumns: col.tableColumns?.map((tc) =>
              tc.tableId === selectedTable._id ? { ...tc, tableColumn } : tc
            ),
          };
        } else {
          return {
            ...col,
            tableColumns: [
              ...(col.tableColumns || []),
              {
                tableId: selectedTable._id,
                tableName: selectedTable.tableName,
                tableColumn,
              },
            ],
          };
        }
      }
      return col;
    });

    setColumns(updatedColumns);
  };

  return (
    <div className="h-full flex text-dark">
      {/* Left Panel - Tables */}
      <div className="w-96 flex flex-col gap-4 p-8">
        <h2 className="text-left text-lg font-semibold">Attached Tables</h2>

        <div className="flex flex-col gap-8">
          {/* Attach Table Button */}
          <div className="relative border border-dashed border-light-gray-3 rounded-lg p-2 flex items-center justify-between gap-2 cursor-pointer text-light-gray-3">
            <div className="flex flex-1 items-center opacity-30">
              <span className="flex-1 text-left">Table-12312</span>
              <span className="bg-light-gray-2 text-xs px-2 py-1 rounded">Table-12345</span>
            </div>
            <FaSquarePlus className="text-light-gray-3 text-xl" />

            <button
              onClick={() => setShowModal(true)}
              disabled={disabled}
              className="absolute left-1/2 transform -translate-x-1/2 rounded-full h-8 px-4 py-2 flex items-center gap-2 bg-dark-blue text-white hover:bg-opacity-90 transition-all"
            >
              <LuPlus className="text-2xl" />
              <span className="text-sm">Attach Table</span>
            </button>
          </div>

          {/* Attached Tables List */}
          <div className="flex flex-col gap-2">
            {attachedTables.map((table) => {
              const isSelected = selectedTable?._id === table._id;
              const showDeleteIcon = hoveredTableId === table._id;

              return (
                <div
                  key={table._id}
                  className="flex items-center"
                  onMouseEnter={() => setHoveredTableId(table._id)}
                  onMouseLeave={() => setHoveredTableId(null)}
                >
                  <div className="w-full flex items-center gap-2 cursor-pointer rounded-lg">
                    <div
                      onClick={() => setSelectedTable(table)}
                      className={`relative flex flex-1 items-center gap-1 justify-between border px-3 py-2 rounded-lg ${
                        isSelected
                          ? "text-dark-blue bg-white border-dark-blue"
                          : "bg-[#F7F7FC] border-light-gray-3"
                      }`}
                    >
                      {isSelected ? (
                        <MdKeyboardArrowDown />
                      ) : (
                        <MdKeyboardArrowUp />
                      )}
                      <span className="text-sm font-medium flex-1 truncate">
                        {table.tableName}
                      </span>
                      <span className="bg-light-gray-1 ml-auto rounded-md p-1 box-content text-xs text-dark-blue flex-shrink-0">
                        Table-{table._id.slice(-5)}
                      </span>
                    </div>
                    {showDeleteIcon && !disabled && (
                      <BsTrash3
                        className="text-red cursor-pointer"
                        onClick={() => handleDetachTable(table._id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Column Mappings */}
      <div className="max-w-3xl h-full flex flex-1 flex-col gap-4 border-l border-light-gray-3 p-8">
        <h2 className="text-left text-lg font-semibold">Column Setting</h2>

        {selectedTable ? (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center">
              <div className="relative flex flex-1 items-center justify-start gap-2 border border-light-gray-3 text-sm text-light-gray-3 rounded-lg p-2">
                <FaRegFolderOpen />
                <span className="text-nowrap">Collection Columns</span>
                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 z-10 w-2 h-2 rounded-full bg-light-gray-2 border border-light-gray-3"></div>
              </div>
              <div className="w-4 border-b border-light-gray-3"></div>
              <div className="relative flex flex-1 items-center justify-start gap-2 border border-light-gray-3 text-sm text-light-gray-3 rounded-lg p-2">
                <PiTableLight />
                <span>Table Columns</span>
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 z-10 w-2 h-2 rounded-full bg-light-gray-2 border border-light-gray-3"></div>
              </div>
            </div>

            {/* Mappings */}
            {columns.map((column) => {
              const mapping = column.tableColumns?.find(
                (tc) => tc.tableId === selectedTable._id
              );
              const isMapped = !!mapping;

              return (
                <div
                  key={column.id}
                  className="flex flex-col border border-light-gray-3 rounded-xl p-1"
                >
                  <div className="flex items-center">
                    {/* Collection Column */}
                    <div className="relative flex flex-1 items-center justify-start gap-2 bg-light-gray-2 border-2 border-[#D8D8F3] text-sm text-dark rounded-lg px-2 py-4">
                      <span className="text-nowrap text-sm font-semibold truncate">
                        {column.name}
                      </span>
                      <div
                        className={`absolute top-1/2 -right-1 transform -translate-y-1/2 z-10 w-2 h-2 rounded-full bg-white border ${
                          isMapped ? "border-dark-blue" : "border-light-gray-3"
                        }`}
                      ></div>
                    </div>
                    <div
                      className={`w-4 border-b ${
                        isMapped ? "border-dark-blue" : "border-light-gray-3"
                      }`}
                    ></div>
                    {/* Table Column */}
                    <div className="relative flex flex-1 items-center justify-start gap-2 bg-white border-2 border-[#D8D8F3] text-sm text-dark rounded-lg p-2">
                      {isMapped ? (
                        <div className="w-full px-2 py-1 bg-light-gray-2 border-light-gray-3 text-dark-blue rounded-full flex items-center gap-2">
                          <IoMdRadioButtonOn className="text-lg flex-shrink-0" />
                          <span className="truncate">{mapping.tableColumn}</span>
                        </div>
                      ) : (
                        <select
                          onChange={(e) =>
                            handleMapColumn(column.id, e.target.value)
                          }
                          disabled={disabled}
                          className="w-full bg-transparent border-none outline-none text-sm"
                          defaultValue=""
                        >
                          <option value="">Select Table Column</option>
                          {selectedTable.columns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      )}
                      <div
                        className={`absolute top-1/2 -left-1 transform -translate-y-1/2 z-10 w-2 h-2 rounded-full bg-white border ${
                          isMapped ? "border-dark-blue" : "border-light-gray-3"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a table to map columns
          </div>
        )}
      </div>

      {/* Table Selection Modal */}
      {showModal && (
        <TableSelectionModal
          tables={tables}
          attachedTableIds={attachedTables.map((t) => t._id)}
          loading={loading}
          onClose={() => setShowModal(false)}
          onAttach={(tableId) => {
            handleAttachTable(tableId);
            setShowModal(false);
          }}
          disabled={disabled}
        />
      )}
    </div>
  );
}
