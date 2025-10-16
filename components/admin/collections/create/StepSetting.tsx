"use client";

import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { BsTrash3 } from "react-icons/bs";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { RxDragHandleDots2 } from "react-icons/rx";

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

interface Step {
  id: number;
  name: string;
}

interface StepSettingProps {
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  disabled?: boolean;
}

export default function StepSetting({
  columns,
  setColumns,
  disabled,
}: StepSettingProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [hoveredStepId, setHoveredStepId] = useState<number | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<number | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<number | null>(null);

  useEffect(() => {
    // Extract unique step names from columns
    const stepNames = Array.from(
      new Set(
        columns
          .map((col) => col.stepName)
          .filter((name) => name && name !== "")
      )
    ) as string[];
    
    if (stepNames.length === 0) return;
    
    setSteps((prevSteps) => {
      // If no previous steps, create new ones
      if (prevSteps.length === 0) {
        return stepNames.map((name, index) => ({
          id: index + 1,
          name,
        }));
      }
      
      // Merge new step names with existing steps, preserving IDs
      const updatedSteps: Step[] = [];
      let maxId = Math.max(...prevSteps.map((s) => s.id), 0);
      
      stepNames.forEach((name) => {
        const existing = prevSteps.find((s) => s.name === name);
        if (existing) {
          updatedSteps.push(existing);
        } else {
          maxId++;
          updatedSteps.push({ id: maxId, name });
        }
      });
      
      return updatedSteps;
    });
  }, [columns]);

  const handleClickNewStep = () => {
    const Ids = steps.map((step) => step.id);
    const maxID = Ids.length > 0 ? Math.max(...Ids) : 0;

    const newStep = {
      id: maxID + 1,
      name: `Step ${maxID + 1}`,
    };

    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
  };

  const handleDeleteStep = (id: number) => {
    const stepToDelete = steps.find((step) => step.id === id);
    if (stepToDelete) {
      const updatedSteps = steps.filter((step) => step.id !== id);
      setSteps(updatedSteps);

      // Clear stepName from columns
      setColumns(
        columns.map((column) =>
          column.stepName === stepToDelete.name ? { ...column, stepName: "" } : column
        )
      );

      if (selectedStepId === id) {
        setSelectedStepId(null);
      }
    }
  };

  const handleChangeStepName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSteps = steps.map((step) =>
      step.id === selectedStepId ? { ...step, name: event.target.value } : step
    );
    setSteps(updatedSteps);

    // Update the stepName in columns
    const selectedStep = steps.find((s) => s.id === selectedStepId);
    if (selectedStep) {
      const updatedColumns = columns.map((column) =>
        column.stepName === selectedStep.name
          ? { ...column, stepName: event.target.value }
          : column
      );
      setColumns(updatedColumns);
    }
  };

  const handleAttachColumnToStep = (e: React.MouseEvent, columnId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selectedStep = steps.find((s) => s.id === selectedStepId);
    if (!selectedStep) return;

    const column = columns.find((column) => column.id === columnId);
    if (column && column.stepName !== selectedStep.name) {
      const updatedColumns = columns.map((col) =>
        col.id === columnId ? { ...col, stepName: selectedStep.name } : col
      );
      setColumns(updatedColumns);
    }
  };

  const handleDetachColumn = (e: React.MouseEvent, columnId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, stepName: "" } : col
    );
    setColumns(updatedColumns);
  };

  // Drag and drop handlers
  const handleDragStart = (columnId: number) => {
    setDraggedColumnId(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    if (draggedColumnId === null || draggedColumnId === targetColumnId) return;

    const selectedStep = steps.find((s) => s.id === selectedStepId);
    if (!selectedStep) return;

    // Get columns in this step
    const stepColumns = columns.filter((col) => col.stepName === selectedStep.name);
    const draggedIndex = stepColumns.findIndex((col) => col.id === draggedColumnId);
    const targetIndex = stepColumns.findIndex((col) => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder columns
    const reordered = [...stepColumns];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Update all columns with new order
    const otherColumns = columns.filter((col) => col.stepName !== selectedStep.name);
    setColumns([...otherColumns, ...reordered]);
    setDraggedColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedColumnId(null);
  };

  const selectedStep = steps.find((s) => s.id === selectedStepId);
  const relatedColumns = columns.filter(
    (column) => selectedStep && column.stepName === selectedStep.name
  );
  const availableColumns = columns.filter(
    (column) => !column.stepName || column.stepName === ""
  );

  return (
    <div className="h-full flex text-dark">
      {/* Left Panel - Steps */}
      <div className="w-96 flex flex-col gap-4 p-8">
        <h2 className="text-left text-lg font-semibold">Steps</h2>
        
        <div className="flex flex-col gap-8">
          {/* New Step Button Skeleton */}
          <div className="relative border border-dashed border-light-gray-3 rounded-lg p-2 flex items-center justify-between gap-2 cursor-pointer font-redacted-script text-light-gray-3">
            <div className="flex flex-1 items-center">
              <span className="flex-1 text-left">Step-12312</span>
            </div>
            <button
              onClick={handleClickNewStep}
              disabled={disabled}
              className="absolute left-1/2 transform -translate-x-1/2 rounded-full h-8 px-4 py-2 flex items-center gap-2 bg-dark-blue text-white hover:bg-opacity-90 transition-all"
            >
              <LuPlus className="text-2xl" />
              <span className="font-raleway text-sm">New Step</span>
            </button>
          </div>

          {/* Steps List */}
          <div className="flex flex-col gap-2">
            {steps.map((step) => {
              const isSelected = selectedStepId === step.id;
              const showDeleteIcon = hoveredStepId === step.id;

              return (
                <div
                  key={step.id}
                  className="flex items-center"
                  onMouseEnter={() => setHoveredStepId(step.id)}
                  onMouseLeave={() => setHoveredStepId(null)}
                >
                  <div className="w-full flex items-center gap-2 cursor-pointer rounded-lg">
                    <div
                      onClick={() => setSelectedStepId(step.id)}
                      className={`relative flex flex-1 items-center justify-start gap-2 border p-2 rounded-lg ${
                        isSelected
                          ? "text-dark-blue bg-white border-dark-blue"
                          : "bg-[#F7F7FC] border-light-gray-3"
                      }`}
                    >
                      {isSelected ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
                      <span className="flex-1">{step.name}</span>
                    </div>
                    {showDeleteIcon && !disabled && (
                      <BsTrash3
                        className="text-red cursor-pointer hover:opacity-70"
                        onClick={() => handleDeleteStep(step.id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Step Columns */}
      <div className="max-w-3xl flex-1 flex flex-col gap-4 border-l border-light-gray-3 p-8">
        {selectedStep ? (
          <div className="flex flex-col gap-8">
            {/* Step Name Input */}
            <div className="bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
              <div className="p-4 border-b border-dashed border-light-gray-1 text-left">
                <h3 className="font-semibold">Step Name</h3>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  value={selectedStep.name}
                  onChange={handleChangeStepName}
                  disabled={disabled}
                  className="w-full p-2 border border-light-gray-3 rounded-lg outline-none focus:border-dark-blue"
                  placeholder="Enter step name"
                />
              </div>
            </div>

            {/* Available Columns */}
            {!disabled && availableColumns.length > 0 && (
              <div className="bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
                <div className="p-4 border-b border-dashed border-light-gray-1 text-left">
                  <h3 className="font-semibold">Available Columns</h3>
                </div>
                <div className="p-6 flex flex-wrap gap-2">
                  {availableColumns.map((column) => (
                    <button
                      key={column.id}
                      onClick={(e) => handleAttachColumnToStep(e, column.id)}
                      className="inline-flex items-center gap-2 border-2 border-light-gray-3 rounded-lg px-3 py-2 bg-[#F7F7FC] hover:border-[#4040BF] hover:bg-white hover:text-dark-blue cursor-pointer transition-all group"
                    >
                      <span className="font-medium">{column.name}</span>
                      <span className="bg-light-gray-2 text-xs px-2 py-0.5 rounded">
                        {column.type}
                      </span>
                      <LuPlus className="text-lg text-dark-blue flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step Columns */}
            <div className="flex flex-col gap-2">
              <h2 className="text-left text-lg font-semibold">Step Columns</h2>
              <div className="flex flex-col gap-2">
                {relatedColumns.map((column) => {
                  const showDeleteIcon = hoveredColumnId === column.id;
                  
                  return (
                    <div
                      key={column.id}
                      draggable={!disabled}
                      onDragStart={() => handleDragStart(column.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => setHoveredColumnId(column.id)}
                      onMouseLeave={() => setHoveredColumnId(null)}
                      className={`border border-light-gray-3 rounded-lg p-3 flex items-center gap-2 bg-[#F7F7FC] transition-all ${
                        draggedColumnId === column.id ? "opacity-50" : ""
                      } ${!disabled ? "cursor-move" : ""}`}
                    >
                      {!disabled && (
                        <RxDragHandleDots2 className="text-xl text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex flex-1 items-center gap-4">
                        <span className="flex-1 text-left font-medium">{column.name}</span>
                        <span className="bg-light-gray-2 text-xs px-2 py-1 rounded">
                          {column.type}
                        </span>
                      </div>
                      {showDeleteIcon && !disabled && (
                        <BsTrash3
                          onClick={(e) => handleDetachColumn(e, column.id)}
                          className="text-red cursor-pointer hover:opacity-70 flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
                {relatedColumns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No columns in this step. Add columns from available columns above.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a step from the left to configure its columns
          </div>
        )}
      </div>
    </div>
  );
}
