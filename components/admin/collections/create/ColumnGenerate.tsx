"use client";

import { useState, useEffect } from "react";
import { IoMdRadioButtonOn } from "react-icons/io";
import Input from "@/components/common/Inputs/Input";
import NumberInput from "@/components/common/Inputs/NumberInput";
import SwitchButton from "@/components/common/ui/SwitchButton";

const valueTypes = [
  "Mixed",
  "Text",
  "Number",
  "ZIP Code",
  "Boolean",
  "Email",
  "Phone Number",
  "Mobile",
  "Date",
  "Duration",
  "First Name",
  "Last Name",
  "Company Name",
  "City",
  "Address",
];

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

interface ColumnGenerateProps {
  columns: Column[];
  disabled?: boolean;
  error: any;
  setColumns: (columns: Column[]) => void;
  setErrors: (error: any) => void;
}

export default function ColumnGenerate({
  columns,
  disabled,
  error,
  setColumns,
  setErrors,
}: ColumnGenerateProps) {
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [columnData, setColumnData] = useState<Column>({
    id: 0,
    name: "",
    showToClient: true,
    type: "Text",
    isAdditionalFee: false,
    additionalFee: 0,
    optional: false,
  });

  useEffect(() => {
    const column = columns.find((column) => column.id === selectedColumnId);
    if (column) {
      setColumnData(column);
    }
  }, [selectedColumnId, columns]);

  useEffect(() => {
    if (selectedColumnId) {
      const updatedColumns = columns.map((column) =>
        column.id === selectedColumnId ? columnData : column
      );
      setColumns(updatedColumns);
    }
  }, [columnData, selectedColumnId, columns, setColumns]);

  const handleClickNewColumn = () => {
    const Ids = columns.map((column) => column.id);
    const maxID = Ids.length > 0 ? Math.max(...Ids) : 0;

    const newColumn = {
      id: maxID + 1,
      name: `Column ${maxID + 1}`,
      type: "Text",
      showToClient: true,
      isAdditionalFee: false,
      additionalFee: 0.0001,
      optional: false,
    };

    setColumns([...columns, newColumn]);
    setSelectedColumnId(maxID + 1);
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      columnGenerate: "",
    }));
  };

  const handleDeleteColumn = (id: number) => {
    const updatedColumns = columns.filter((column) => column.id !== id);
    setColumns(updatedColumns);
    if (selectedColumnId === id) {
      setSelectedColumnId(null);
    }
  };

  return (
    <div className="h-full flex text-dark">
      {/* Left Panel - Column List */}
      <div className="w-96 flex flex-col gap-4 p-6">
        <h2 className="text-left text-lg font-semibold">Columns</h2>
        <div className="flex flex-col gap-4">
          {/* New Column Button */}
          <button
            onClick={handleClickNewColumn}
            disabled={disabled}
            className="w-full border-2 border-dashed border-light-gray-3 rounded-lg p-4 text-light-gray-3 hover:border-dark-blue hover:text-dark-blue cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            <span>New Column</span>
          </button>

          {error && <div className="text-red text-left text-sm">{error}</div>}

          {/* Column List */}
          <div className="flex flex-col gap-2">
            {columns.map((column) => (
              <div
                key={column.id}
                onClick={() => setSelectedColumnId(column.id)}
                className={`relative flex items-center justify-between border px-3 py-2 rounded-lg cursor-pointer ${
                  selectedColumnId === column.id
                    ? "bg-white border-dark-blue text-dark-blue"
                    : "bg-[#F7F7FC] border-light-gray-3"
                }`}
              >
                <span className="font-medium">{column.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteColumn(column.id);
                  }}
                  disabled={disabled}
                  className="text-red hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Column Settings */}
      <div className="flex flex-1 flex-col gap-4 border-l border-light-gray-3 p-6">
        <h2 className="text-left text-lg font-semibold">Column Setting</h2>

        {selectedColumnId ? (
          <>
            {/* General Section */}
            <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
              <div className="p-4 border-b border-dashed border-light-gray-3 text-left font-bold">
                General
              </div>
              <div className="flex flex-col gap-4 p-6 border-b border-dashed border-light-gray-3">
                <Input
                  label="Column Name"
                  type="text"
                  value={columnData.name}
                  disabled={disabled ?? false}
                  onChange={(e) =>
                    setColumnData({ ...columnData, name: e.target.value })
                  }
                  error=""
                />
                <div className="flex items-center gap-2">
                  <SwitchButton
                    value={!columnData.showToClient}
                    disabled={disabled ?? false}
                    onChange={() =>
                      setColumnData((prev) => ({
                        ...prev,
                        showToClient: !prev.showToClient,
                      }))
                    }
                  />
                  <span className="text-left">
                    Don't show this column in clients file
                  </span>
                </div>
              </div>
              <div className="p-6">
                {/* Value Type Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-left text-sm text-light-dark font-medium">
                    Value Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {valueTypes.map((type) => (
                      <button
                        key={type}
                        disabled={disabled}
                        onClick={() => setColumnData({ ...columnData, type })}
                        className={`flex items-center gap-2 px-2 py-1 rounded-full border ${
                          columnData.type === type
                            ? "border-dark-blue text-dark-blue"
                            : "border-light-gray-3 text-light-gray-3"
                        } cursor-pointer hover:bg-light-gray-1`}
                      >
                        <IoMdRadioButtonOn />
                        <span
                          className={`${
                            columnData.type === type ? "text-dark-blue" : "text-dark"
                          }`}
                        >
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Fees Section */}
            <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
              <div className="p-4 border-b border-dashed border-light-gray-3 text-left font-bold">
                Additional Fees
              </div>
              <div className="flex flex-col p-6 gap-4">
                <div className="flex items-center gap-2">
                  <SwitchButton
                    value={columnData.isAdditionalFee}
                    disabled={disabled ?? false}
                    onChange={() =>
                      setColumnData((prev) => ({
                        ...prev,
                        isAdditionalFee: !prev.isAdditionalFee,
                      }))
                    }
                  />
                  <span className="text-left">This column has an additional fee</span>
                </div>
                {columnData.isAdditionalFee && (
                  <div className="flex flex-col gap-4">
                    <NumberInput
                      label="Additional Fee"
                      value={columnData.additionalFee}
                      disabled={disabled ?? false}
                      isCurrency={true}
                      onChange={(value) =>
                        setColumnData({ ...columnData, additionalFee: value })
                      }
                      error=""
                    />
                    <div className="flex items-center gap-2">
                      <SwitchButton
                        value={columnData.optional ?? false}
                        disabled={disabled ?? false}
                        onChange={() =>
                          setColumnData((prev) => ({
                            ...prev,
                            optional: !prev.optional,
                          }))
                        }
                      />
                      <span className="text-left">the column is optional</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a column to edit its settings
          </div>
        )}
      </div>
    </div>
  );
}
