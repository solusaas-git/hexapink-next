"use client";

import React from "react";
import { IoCloseSharp } from "react-icons/io5";

interface TableMapping {
  tableName: string;
  tableColumn: string;
}

interface TableMappingsModalProps {
  columnName: string;
  mappings: TableMapping[];
  onClose: () => void;
}

const TableMappingsModal: React.FC<TableMappingsModalProps> = ({
  columnName,
  mappings,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray-1">
          <h2 className="text-xl font-bold text-dark">
            Table Mappings for "{columnName}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-dark transition-colors"
          >
            <IoCloseSharp className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {mappings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No table mappings configured for this column.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
                <span className="w-[10%] p-3 flex font-semibold">#</span>
                <span className="w-[45%] p-3 flex font-semibold">Table Name</span>
                <span className="w-[45%] p-3 flex font-semibold">Table Column</span>
              </div>

              {/* Rows */}
              {mappings.map((mapping, index) => (
                <div
                  key={index}
                  className="w-full bg-[#F7F7FC] border border-light-gray-3 rounded-lg flex items-center"
                >
                  <div className="w-[10%] p-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="w-[45%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                    <span className="truncate">{mapping.tableName}</span>
                  </div>
                  <div className="w-[45%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                    <span className="truncate">{mapping.tableColumn}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-light-gray-1">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableMappingsModal;

