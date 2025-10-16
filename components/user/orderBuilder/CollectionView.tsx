import NextImage from "next/image";
import React, { useState } from "react";
import { Package, Plus, Minus, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { Collection } from "@/types/orderBuilder";

interface CollectionViewProps {
  data: Collection;
  filteredDataCount: number;
  purchasedCount: number;
  calcMode: string;
  volume: number;
  subTotal: number;
  additionalFee: number;
  budgetInput: number;
  selectedOptionalColumns: number[];
  errors: Record<string, string>;
  leadsLoading: boolean;
  handleChangeValue: (option: string, value: number) => void;
  handleOptionChange: (option: string) => void;
  handleOptionalFieldToggle: (columnId: number) => void;
}

export default function CollectionView({
  data,
  filteredDataCount,
  purchasedCount,
  calcMode,
  volume,
  subTotal,
  additionalFee,
  budgetInput,
  selectedOptionalColumns,
  errors,
  leadsLoading,
  handleChangeValue,
  handleOptionChange,
  handleOptionalFieldToggle,
}: CollectionViewProps) {
  const totalPrice = subTotal + additionalFee;
  const unitPrice = data.fee || 0;

  // Get optional columns
  const optionalColumns = data.columns?.filter((col) => col.optional) || [];
  
  // State for showing all included fields
  const [showAllIncludedFields, setShowAllIncludedFields] = useState(false);

  // Show loading state
  if (leadsLoading) {
    return (
      <div className="bg-white rounded-xl border-2 border-dark-blue overflow-hidden shadow-lg">
        <div className="p-5 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4 mb-3">
            {data.mobileImage || data.image ? (
              <NextImage
                src={
                  (data.mobileImage || data.image)?.startsWith('/')
                    ? (data.mobileImage || data.image)!
                    : `/${data.mobileImage || data.image}`
                }
                alt={data.title}
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-pink to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="text-white" size={32} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-dark truncate">{data.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{data.type}</span>
                <span>{data.countries.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-dark-blue animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Calculating total leads...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-dark-blue overflow-hidden shadow-lg">
      {/* Collection Header */}
      <div className="p-5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 mb-3">
          {data.mobileImage || data.image ? (
            <NextImage
              src={
                (data.mobileImage || data.image)?.startsWith('/')
                  ? (data.mobileImage || data.image)!
                  : `/${data.mobileImage || data.image}`
              }
              alt={data.title}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-pink to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="text-white" size={32} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-dark truncate">{data.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded">{data.type}</span>
              <span>{data.countries.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Already Purchased Amount */}
      <div className="p-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm font-medium">Already Purchased Amount</span>
          <span className="text-dark-blue text-xl font-bold">{purchasedCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Set a Limit */}
      <div className="p-5 border-b border-gray-200">
        <h4 className="text-gray-700 font-semibold mb-4">Set a Limit of</h4>
        
        {/* Volume/Budget Toggle */}
        <div className="flex gap-3 mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={calcMode === "Volume"}
              onChange={() => handleOptionChange("Volume")}
              className="w-5 h-5 text-dark-blue"
            />
            <span className="ml-2 text-gray-700 font-medium">Volume</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={calcMode === "Budget"}
              onChange={() => handleOptionChange("Budget")}
              className="w-5 h-5 text-dark-blue"
            />
            <span className="ml-2 text-gray-700 font-medium">Budget</span>
          </label>
        </div>

        {/* Volume or Budget Input with +/- buttons */}
        <div className="flex items-center gap-3">
          {calcMode === "Volume" ? (
            <>
              <input
                type="number"
                value={volume}
                onChange={(e) => handleChangeValue("Volume", parseInt(e.target.value) || 0)}
                className={`flex-1 p-3 text-2xl font-bold text-dark-blue border rounded-lg outline-none transition-colors ${
                  errors.volume
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-dark-blue"
                }`}
                placeholder="0"
                min="0"
                max={filteredDataCount}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangeValue("Volume", Math.max(0, volume - 1000))}
                  disabled={volume === 0}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleChangeValue("Volume", volume + 1000)}
                  disabled={volume >= filteredDataCount}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                value={budgetInput || ""}
                onChange={(e) => handleChangeValue("Budget", parseFloat(e.target.value) || 0)}
                className="flex-1 p-3 text-2xl font-bold text-dark-blue border border-gray-300 rounded-lg outline-none focus:border-dark-blue transition-colors"
                placeholder="Enter budget"
                min="0"
                step="0.01"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangeValue("Budget", Math.max(0, budgetInput - 100))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleChangeValue("Budget", budgetInput + 100)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>
            </>
          )}
        </div>
        {errors.volume && (
          <p className="text-red-500 text-xs mt-2">{errors.volume}</p>
        )}
        {volume >= filteredDataCount && volume > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-xs font-medium">
              You've reached the maximum available volume ({filteredDataCount.toLocaleString()} leads)
            </p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="p-5 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Available Volume</span>
          <span className="text-dark-blue text-xl font-bold">{filteredDataCount.toLocaleString()}</span>
        </div>
        {purchasedCount > 0 && (
          <div className="flex items-center justify-between text-sm bg-purple-50 p-2 rounded-lg">
            <span className="text-purple-700 font-medium">Already Purchased</span>
            <span className="text-purple-700 text-lg font-bold">{purchasedCount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Ordered Volume</span>
          <span 
            className="text-xl font-bold"
            style={{ color: volume === 0 ? "#EF4444" : "#059669" }}
          >
            {volume.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Unit Price</span>
          <span className="text-dark-blue text-xl font-bold">$ {unitPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-3 border-t border-dashed border-gray-300">
          <span className="text-gray-700 font-medium">Sub Total</span>
          <span className="text-dark-blue text-xl font-bold">$ {subTotal.toFixed(2)}</span>
        </div>
        {additionalFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">
              Additional Fee
              <span className="block text-xs text-gray-500 mt-0.5">
                (Optional fields)
              </span>
            </span>
            <span className="text-pink text-xl font-bold">$ {additionalFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-300">
          <span className="text-gray-900 font-bold">Grand Total</span>
          <span className="text-dark-blue text-2xl font-bold">$ {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Optional Fields */}
      {optionalColumns.length > 0 && (
        <div className="p-5 border-b border-gray-200">
          <h4 className="text-gray-700 font-semibold mb-3">Optional Fields</h4>
          <div className="space-y-2">
            {optionalColumns.map((column) => {
              const isSelected = selectedOptionalColumns.includes(column.id);
              const fieldFee = column.additionalFee || 0;
              const totalFieldFee = fieldFee * volume;
              
              return (
                <button
                  key={column.id}
                  onClick={() => handleOptionalFieldToggle(column.id)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-dark-blue border-dark-blue"
                        : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">{column.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      ${fieldFee.toFixed(2)}/lead
                    </span>
                    {isSelected && volume > 0 && (
                      <span className="text-sm font-semibold text-dark-blue">
                        +${totalFieldFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Included Fields */}
      {data.columns && data.columns.filter((col) => !col.optional).length > 0 && (
        <div className="p-5">
          <h4 className="text-gray-700 font-semibold mb-3">Included Fields</h4>
          <div className="space-y-2">
            {data.columns
              .filter((col) => !col.optional)
              .slice(0, showAllIncludedFields ? undefined : 5)
              .map((column) => (
                <div
                  key={column.id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <Check size={16} className="text-green flex-shrink-0" />
                  <span>{column.name}</span>
                </div>
              ))}
            {data.columns.filter((col) => !col.optional).length > 5 && (
              <button
                onClick={() => setShowAllIncludedFields(!showAllIncludedFields)}
                className="flex items-center gap-2 text-sm text-dark-blue hover:text-dark-blue/80 font-medium mt-2 transition-colors"
              >
                {showAllIncludedFields ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Show All ({data.columns.filter((col) => !col.optional).length} fields)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

