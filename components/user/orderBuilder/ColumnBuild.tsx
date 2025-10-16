import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Calendar, CheckSquare, Square, MinusSquare } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import api from "@/lib/api-client";
import type { Column, SelectedData } from "@/types/orderBuilder";

interface ColumnBuildProps {
  column: Column;
  selectedData: SelectedData;
  setColumns: (columnType: string, columnName: string, selectedValue: any) => void;
  disabled?: boolean;
}

// Cache for unique values to avoid re-processing
// Using a more persistent cache with better key structure
const uniqueValuesCache = new Map<string, { values: string[], timestamp: number }>();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export default function ColumnBuild({
  column,
  selectedData,
  setColumns,
  disabled = false,
}: ColumnBuildProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [rangeValues, setRangeValues] = useState({ min: "", max: "" });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [zipCodeMode, setZipCodeMode] = useState<"select" | "range">("select");

  // Extract unique values from related tables with caching
  useEffect(() => {
    const extractUniqueValues = async () => {
      try {
        if (!column.tableColumns || column.tableColumns.length === 0) {
          console.log(`No table columns for ${column.name}`);
          setUniqueValues([]);
          setLoading(false);
          return;
        }

        // Create a stable cache key based on table IDs and column names
        const tableColumnKeys = column.tableColumns
          .map(tc => `${tc.tableId}:${tc.tableColumn}`)
          .sort()
          .join('|');
        const cacheKey = `col_${column.name}_${tableColumnKeys}`;
        
        // Check cache first with expiry
        const cached = uniqueValuesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
          console.log(`✓ Cache HIT for ${column.name} (${cached.values.length} values)`);
          setUniqueValues(cached.values);
          setLoading(false);
          return;
        }

        // Cache miss or expired - fetch from API
        console.log(`⟳ Cache MISS for ${column.name} - Fetching from API...`);
        setLoading(true);
        
        const response = await api.post("/table/column-values", {
          tableColumns: column.tableColumns,
        });

        if (response.data.success) {
          const sortedValues = response.data.values || [];
          
          // Store in cache with timestamp
          uniqueValuesCache.set(cacheKey, {
            values: sortedValues,
            timestamp: Date.now()
          });
          
          setUniqueValues(sortedValues);
          console.log(`✓ Fetched and cached ${sortedValues.length} values for ${column.name}`);
        } else {
          console.error(`✗ Failed to fetch values for ${column.name}:`, response.data.message);
          setUniqueValues([]);
        }
      } catch (error) {
        console.error(`✗ Error extracting unique values for ${column.name}:`, error);
        setUniqueValues([]);
      } finally {
        setLoading(false);
      }
    };

    extractUniqueValues();
  }, [column]);

  // Initialize selected values from selectedData
  useEffect(() => {
    const currentSelection = selectedData[column.name];
    if (currentSelection) {
      if (Array.isArray(currentSelection.value)) {
        setSelectedValues(currentSelection.value);
        if (column.type === "ZIP Code") {
          setZipCodeMode("select");
        }
      } else if (typeof currentSelection.value === "object") {
        setRangeValues(currentSelection.value as { min: string; max: string });
        if (column.type === "ZIP Code") {
          setZipCodeMode("range");
        }
      }
    }
  }, [selectedData, column.name, column.type]);

  // Group values by first letter or category
  const groupedValues = useMemo(() => {
    const groups: Record<string, string[]> = {};
    
    uniqueValues.forEach((value) => {
      // Get first character (uppercase) or '#' for numbers/special chars
      const firstChar = value.charAt(0).toUpperCase();
      const groupKey = /[A-Z]/.test(firstChar) ? firstChar : '#';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(value);
    });
    
    return groups;
  }, [uniqueValues]);

  // Filter values based on search and expand all groups when searching
  const filteredGroupedValues = useMemo(() => {
    if (!search) {
      return groupedValues;
    }
    
    // When searching, filter values and auto-expand matching groups
    const filtered: Record<string, string[]> = {};
    const searchLower = search.toLowerCase();
    
    Object.entries(groupedValues).forEach(([group, values]) => {
      const matchingValues = values.filter((val) =>
        val.toLowerCase().includes(searchLower)
      );
      
      if (matchingValues.length > 0) {
        filtered[group] = matchingValues;
        // Auto-expand groups with matches
        setExpandedGroups(prev => new Set([...prev, group]));
      }
    });
    
    return filtered;
  }, [groupedValues, search]);

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  // Get all values from filtered groups
  const getAllFilteredValues = () => {
    return Object.values(filteredGroupedValues).flat();
  };

  // Handle checkbox change for multi-select
  const handleValueToggle = (value: string) => {
    if (disabled) return;
    
    let newSelected: string[];
    if (selectedValues.includes(value)) {
      newSelected = selectedValues.filter((v) => v !== value);
    } else {
      newSelected = [...selectedValues, value];
    }
    
    setSelectedValues(newSelected);
    setColumns(column.type, column.name, newSelected);
  };

  // Handle select all / deselect all for a group
  const handleGroupSelectAll = (groupKey: string, groupValues: string[]) => {
    if (disabled) return;
    
    const allSelected = groupValues.every(val => selectedValues.includes(val));
    
    let newSelected: string[];
    if (allSelected) {
      // Deselect all in this group
      newSelected = selectedValues.filter(v => !groupValues.includes(v));
    } else {
      // Select all in this group
      newSelected = [...new Set([...selectedValues, ...groupValues])];
    }
    
    setSelectedValues(newSelected);
    setColumns(column.type, column.name, newSelected);
  };

  // Handle select all / deselect all (global)
  const handleSelectAll = () => {
    if (disabled) return;
    
    const allValues = getAllFilteredValues();
    if (selectedValues.length === allValues.length) {
      setSelectedValues([]);
      setColumns(column.type, column.name, []);
    } else {
      setSelectedValues(allValues);
      setColumns(column.type, column.name, allValues);
    }
  };

  // Handle range input for numbers/dates
  const handleRangeChange = (field: "min" | "max", value: string) => {
    if (disabled) return;
    
    const newRange = { ...rangeValues, [field]: value };
    setRangeValues(newRange);
    setColumns(column.type, column.name, newRange);
  };

  // Handle ZIP code mode change
  const handleZipCodeModeChange = (mode: "select" | "range") => {
    if (disabled) return;
    
    setZipCodeMode(mode);
    
    // Clear the opposite mode's data when switching
    if (mode === "range") {
      setSelectedValues([]);
      setColumns(column.type, column.name, { min: "", max: "" });
    } else {
      setRangeValues({ min: "", max: "" });
      setColumns(column.type, column.name, []);
    }
  };

  // Render based on column type
  const renderColumnFilter = () => {
    // ZIP Code type - special handling with both select and range options
    if (column.type === "ZIP Code") {
      return (
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-light-gray-1 rounded-lg">
            <button
              onClick={() => handleZipCodeModeChange("select")}
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                zipCodeMode === "select"
                  ? "bg-white text-dark-blue shadow-sm"
                  : "text-gray-600 hover:text-dark-blue"
              } disabled:cursor-not-allowed`}
            >
              Select ZIP Codes
            </button>
            <button
              onClick={() => handleZipCodeModeChange("range")}
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                zipCodeMode === "range"
                  ? "bg-white text-dark-blue shadow-sm"
                  : "text-gray-600 hover:text-dark-blue"
              } disabled:cursor-not-allowed`}
            >
              ZIP Code Range
            </button>
          </div>

          {/* Render based on selected mode */}
          {zipCodeMode === "range" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    From ZIP Code
                  </label>
                  <input
                    type="text"
                    value={rangeValues.min}
                    onChange={(e) => handleRangeChange("min", e.target.value)}
                    disabled={disabled}
                    className="w-full p-2 border border-light-gray-3 rounded-lg outline-none focus:border-dark-blue transition-colors disabled:bg-gray-100"
                    placeholder="Start ZIP code"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    To ZIP Code
                  </label>
                  <input
                    type="text"
                    value={rangeValues.max}
                    onChange={(e) => handleRangeChange("max", e.target.value)}
                    disabled={disabled}
                    className="w-full p-2 border border-light-gray-3 rounded-lg outline-none focus:border-dark-blue transition-colors disabled:bg-gray-100"
                    placeholder="End ZIP code"
                  />
                </div>
              </div>
              {rangeValues.min && rangeValues.max && (
                <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded-lg">
                  <span className="font-medium">Range: </span>
                  {rangeValues.min} - {rangeValues.max}
                </div>
              )}
            </div>
          ) : (
            // Render the grouped selection UI (same as string type below)
            renderGroupedSelection()
          )}
        </div>
      );
    }

    // Range type (for numbers and dates)
    if (column.type === "number" || column.type === "date") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Min
              </label>
              <input
                type={column.type === "number" ? "number" : "date"}
                value={rangeValues.min}
                onChange={(e) => handleRangeChange("min", e.target.value)}
                disabled={disabled}
                className="w-full p-2 border border-light-gray-3 rounded-lg outline-none focus:border-dark-blue transition-colors disabled:bg-gray-100"
                placeholder={column.type === "number" ? "Min value" : "Start date"}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Max
              </label>
              <input
                type={column.type === "number" ? "number" : "date"}
                value={rangeValues.max}
                onChange={(e) => handleRangeChange("max", e.target.value)}
                disabled={disabled}
                className="w-full p-2 border border-light-gray-3 rounded-lg outline-none focus:border-dark-blue transition-colors disabled:bg-gray-100"
                placeholder={column.type === "number" ? "Max value" : "End date"}
              />
            </div>
          </div>
        </div>
      );
    }

    // Dropdown/Checkbox list (for strings and other types)
    return renderGroupedSelection();
  };

  // Render grouped selection UI (extracted for reuse with ZIP Code select mode)
  const renderGroupedSelection = () => {
    return (
      <div className="space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 p-2 border border-light-gray-3 rounded-lg">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="bg-transparent border-none outline-none flex-1 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Select All */}
        {Object.keys(filteredGroupedValues).length > 0 && (
          <button
            onClick={handleSelectAll}
            disabled={disabled}
            className="flex items-center gap-2 text-sm font-medium text-dark-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedValues.length === getAllFilteredValues().length ? (
              <>
                <MinusSquare size={18} />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare size={18} />
                <span>Select All</span>
              </>
            )}
          </button>
        )}

        {/* Grouped Values List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" color="#4040BF" />
          </div>
        ) : Object.keys(filteredGroupedValues).length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No values found
            {search && " for your search"}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(filteredGroupedValues)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupKey, groupValues]) => {
                const isExpanded = expandedGroups.has(groupKey);
                const groupSelectedCount = groupValues.filter(v => selectedValues.includes(v)).length;
                const allGroupSelected = groupSelectedCount === groupValues.length;
                
                return (
                  <div key={groupKey} className="border border-light-gray-3 rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-light-gray-1">
                      <div className="flex items-center justify-between p-3">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          disabled={disabled}
                          className="flex items-center gap-2 flex-1 text-left disabled:cursor-not-allowed"
                        >
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-gray-600" />
                          ) : (
                            <ChevronUp size={18} className="text-gray-600" />
                          )}
                          <span className="font-bold text-dark-blue">{groupKey}</span>
                          <span className="text-xs text-gray-600 ml-1">
                            ({groupValues.length} {groupValues.length === 1 ? 'item' : 'items'})
                          </span>
                          {groupSelectedCount > 0 && (
                            <span className="ml-auto text-xs font-semibold text-dark-blue bg-dark-blue/10 px-2 py-1 rounded">
                              {groupSelectedCount} selected
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleGroupSelectAll(groupKey, groupValues)}
                          disabled={disabled}
                          className="ml-2 p-1 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={allGroupSelected ? "Deselect all in group" : "Select all in group"}
                        >
                          {allGroupSelected ? (
                            <CheckSquare className="text-dark-blue" size={18} />
                          ) : (
                            <Square className="text-gray-400" size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Group Values */}
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white">
                        {groupValues.map((value, index) => {
                          const isSelected = selectedValues.includes(value);
                          return (
                            <button
                              key={`${value}-${index}`}
                              onClick={() => handleValueToggle(value)}
                              disabled={disabled}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                                isSelected
                                  ? "bg-dark-blue/10 border border-dark-blue"
                                  : "bg-light-gray-1 hover:bg-light-gray-3 border border-transparent"
                              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {isSelected ? (
                                <CheckSquare className="text-dark-blue flex-shrink-0" size={16} />
                              ) : (
                                <Square className="text-gray-400 flex-shrink-0" size={16} />
                              )}
                              <span className={`text-sm ${isSelected ? "font-semibold text-dark-blue" : "text-gray-700"}`}>
                                {value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Selected Count */}
        {selectedValues.length > 0 && (
          <div className="text-sm text-gray-600 text-center pt-2 border-t border-dashed border-light-gray-3">
            {selectedValues.length} selected
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 flex items-center justify-between">
        <h3 className="text-left font-bold">{column.name}</h3>
        {column.type === "date" && <Calendar className="text-gray-400" size={20} />}
      </div>
      <div className="p-4">{renderColumnFilter()}</div>
    </div>
  );
}

