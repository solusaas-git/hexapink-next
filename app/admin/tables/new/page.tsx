"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiTableLight } from "react-icons/pi";
import { GoArrowLeft } from "react-icons/go";
import { PiCheckBold } from "react-icons/pi";
import { IoMdRadioButtonOn } from "react-icons/io";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import FileUpload from "@/components/common/Inputs/FileUpload";
import Input from "@/components/common/Inputs/Input";
import TagSelector from "@/components/common/forms/TagSelector";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import { parseCSV } from "@/lib/utils/csvParser";

const delimiterOptions = ["Comma", "Tab", "Semicolon", "Pipe"];

interface NewTableErrors {
  tableName: string;
  file: string;
  tags: string;
}

export default function NewTablePage() {
  const router = useRouter();
  const [tableName, setTableName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState("Comma");
  const [columnCount, setColumnCount] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedDedupeColumns, setSelectedDedupeColumns] = useState<string[]>([]);
  const [dedupeMode, setDedupeMode] = useState<"file" | "database" | "both">("file");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    tableId?: string;
    actualLeads?: number;
    expectedLeads?: number;
    totalLines?: number;
    skippedRows?: number;
    duplicatesRemoved?: number;
    dbDuplicatesRemoved?: number;
    duplicatesFile?: string;
    dbDuplicatesFile?: string;
  } | null>(null);
  const [errors, setErrors] = useState<NewTableErrors>({
    tableName: "",
    file: "",
    tags: "",
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'csv') {
        setErrors({ ...errors, file: "Only CSV files are supported" });
        return;
      }
      
      setErrors({ ...errors, file: "" });
      setFile(selectedFile);
      
      // Auto-detect delimiter and preview file info
      try {
        const { columns: parsedColumns, rowCount, detectedDelimiter: detectedDelim } = await parseCSV(selectedFile);
        
        // Capitalize first letter to match selection options
        const capitalizedDelimiter = detectedDelim.charAt(0).toUpperCase() + detectedDelim.slice(1);
        setDelimiter(capitalizedDelimiter);
        setColumns(parsedColumns);
        setColumnCount(parsedColumns.length);
        setLeadCount(rowCount);
        setSelectedDedupeColumns([]); // Reset dedupe selection when new file is uploaded
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file. Please check the file format.");
        setFile(null);
      }
    }
  };

  const handleCloseFile = () => {
    setFile(null);
    setDelimiter("Comma");
    setColumns([]);
    setColumnCount(0);
    setLeadCount(0);
    setSelectedDedupeColumns([]);
    setErrors({ ...errors, file: "" });
  };

  const toggleDedupeColumn = (column: string) => {
    setSelectedDedupeColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!tableName.trim()) {
      setErrors((prev) => ({ ...prev, tableName: "Table name is required" }));
      toast.error("Table name is required");
      return;
    }
    
    if (!file) {
      setErrors((prev) => ({ ...prev, file: "CSV file is required" }));
      toast.error("Please upload a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("tableName", tableName);
    formData.append("file", file);
    formData.append("delimiter", delimiter.toLowerCase());
    
    if (selectedTags.length > 0) {
      formData.append("tags", JSON.stringify(selectedTags));
    }
    
    if (selectedDedupeColumns.length > 0) {
      formData.append("dedupeColumns", JSON.stringify(selectedDedupeColumns));
      formData.append("dedupeMode", dedupeMode);
    }

    setLoading(true);
    try {
      const response = await api.post("/admin/tables", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Verify the imported data
      const tableId = response.data._id;
      const createdLeads = response.data.leads;
      const importInfo = response.data._importInfo;
      const totalLines = importInfo?.totalLines || 0;
      const duplicatesRemoved = importInfo?.duplicatesRemoved || 0;
      const dbDuplicatesRemoved = importInfo?.dbDuplicatesRemoved || 0;
      const duplicatesFile = importInfo?.duplicatesFile;
      const dbDuplicatesFile = importInfo?.dbDuplicatesFile;
      const skippedRows = leadCount - createdLeads - duplicatesRemoved - dbDuplicatesRemoved;
      
      // Check if the import was successful and complete
      const expectedAfterDedupe = leadCount - duplicatesRemoved - dbDuplicatesRemoved;
      const totalDuplicates = duplicatesRemoved + dbDuplicatesRemoved;
      
      if (createdLeads === expectedAfterDedupe && skippedRows === 0) {
        let message = "Table imported successfully! All rows processed.";
        if (totalDuplicates > 0) {
          const parts = [];
          if (duplicatesRemoved > 0) parts.push(`${duplicatesRemoved.toLocaleString()} in-file duplicate(s)`);
          if (dbDuplicatesRemoved > 0) parts.push(`${dbDuplicatesRemoved.toLocaleString()} database duplicate(s)`);
          message = `Table imported successfully! ${parts.join(" and ")} removed.`;
        }
        
        setImportResult({
          success: true,
          message,
          tableId,
          actualLeads: createdLeads,
          expectedLeads: leadCount,
          totalLines,
          skippedRows: 0,
          duplicatesRemoved,
          dbDuplicatesRemoved,
          duplicatesFile,
          dbDuplicatesFile,
        });
        toast.success("Table created successfully");
      } else if (skippedRows > 0) {
        setImportResult({
          success: false,
          message: `Import completed with ${skippedRows.toLocaleString()} row(s) skipped`,
          tableId,
          actualLeads: createdLeads,
          expectedLeads: leadCount,
          totalLines,
          skippedRows,
          duplicatesRemoved,
          dbDuplicatesRemoved,
          duplicatesFile,
          dbDuplicatesFile,
        });
        toast.warning(`${skippedRows.toLocaleString()} rows were skipped due to errors`);
      } else {
        let message = "Import completed successfully";
        if (totalDuplicates > 0) {
          const parts = [];
          if (duplicatesRemoved > 0) parts.push(`${duplicatesRemoved.toLocaleString()} in-file`);
          if (dbDuplicatesRemoved > 0) parts.push(`${dbDuplicatesRemoved.toLocaleString()} from database`);
          message = `Import successful! ${parts.join(" and ")} duplicate(s) removed.`;
        }
        
        setImportResult({
          success: true,
          message,
          tableId,
          actualLeads: createdLeads,
          expectedLeads: leadCount,
          totalLines,
          skippedRows,
          duplicatesRemoved,
          dbDuplicatesRemoved,
          duplicatesFile,
          dbDuplicatesFile,
        });
        toast.success("Table created successfully");
      }
    } catch (error: any) {
      console.error("Error creating table:", error);
      setImportResult({
        success: false,
        message: error.response?.data?.message || "Failed to create table",
      });
      toast.error(error.response?.data?.message || "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiTableLight />} label="Create New Table" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" color="#4040BF" />
          <p className="text-light-dark">Importing table data...</p>
        </div>
      </div>
    );
  }

  // Show import result
  if (importResult) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiTableLight />} label="Import Result" />
        
        <div className="flex-1 flex items-center justify-center bg-light-gray p-8">
          <div className="max-w-2xl w-full bg-white border border-light-gray-1 rounded-lg shadow-lg">
            <div className={`p-6 border-b border-dashed border-light-gray-1 ${
              importResult.success ? "bg-green-50" : "bg-red-50"
            }`}>
              <div className="flex items-center gap-3">
                {importResult.success ? (
                  <div className="w-12 h-12 rounded-full bg-green text-white flex items-center justify-center text-2xl">
                    ✓
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red text-white flex items-center justify-center text-2xl">
                    ✕
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-dark">
                    {importResult.success ? "Import Successful" : "Import Issues Detected"}
                  </h3>
                  <p className="text-light-dark">{importResult.message}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {importResult.tableId && (
                <>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-light-gray-2 p-4 rounded-lg">
                      <label className="text-xs text-light-dark font-medium">Expected Leads</label>
                      <p className="text-2xl font-bold text-dark mt-1">
                        {importResult.expectedLeads?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <label className="text-xs text-light-dark font-medium">Successfully Imported</label>
                      <p className="text-2xl font-bold text-green mt-1">
                        {importResult.actualLeads?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-light-gray-2 p-4 rounded-lg">
                      <label className="text-xs text-light-dark font-medium">File Duplicates</label>
                      <p className={`text-2xl font-bold mt-1 ${
                        (importResult.duplicatesRemoved || 0) === 0 ? "text-light-dark" : "text-blue-500"
                      }`}>
                        {(importResult.duplicatesRemoved || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-light-gray-2 p-4 rounded-lg">
                      <label className="text-xs text-light-dark font-medium">DB Duplicates</label>
                      <p className={`text-2xl font-bold mt-1 ${
                        (importResult.dbDuplicatesRemoved || 0) === 0 ? "text-light-dark" : "text-purple-500"
                      }`}>
                        {(importResult.dbDuplicatesRemoved || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-light-gray-2 p-4 rounded-lg">
                      <label className="text-xs text-light-dark font-medium">Skipped Rows</label>
                      <p className={`text-2xl font-bold mt-1 ${
                        (importResult.skippedRows || 0) === 0 ? "text-light-dark" : "text-orange-500"
                      }`}>
                        {(importResult.skippedRows || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {((importResult.duplicatesRemoved || 0) > 0 || (importResult.dbDuplicatesRemoved || 0) > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-dark mb-2">ℹ️ Duplicates Removed</h4>
                      {(importResult.duplicatesRemoved || 0) > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-dark">
                            • <strong>{importResult.duplicatesRemoved?.toLocaleString()}</strong> in-file duplicate(s) (same file)
                          </p>
                          {importResult.duplicatesFile && (
                            <a
                              href={`/${importResult.duplicatesFile}`}
                              download
                              className="text-xs bg-dark-blue text-white px-3 py-1 rounded hover:bg-opacity-90 transition-all"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      )}
                      {(importResult.dbDuplicatesRemoved || 0) > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-dark">
                            • <strong>{importResult.dbDuplicatesRemoved?.toLocaleString()}</strong> database duplicate(s) (existing tables)
                          </p>
                          {importResult.dbDuplicatesFile && (
                            <a
                              href={`/${importResult.dbDuplicatesFile}`}
                              download
                              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-opacity-90 transition-all"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-dark font-medium mt-2 pt-2 border-t border-blue-200">
                        ✓ Unique leads imported: {importResult.actualLeads?.toLocaleString()} rows
                      </p>
                    </div>
                  )}

                  {(importResult.skippedRows || 0) > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-dark mb-2">⚠️ Rows Skipped</h4>
                      <p className="text-sm text-light-dark mb-2">
                        {importResult.skippedRows?.toLocaleString()} row(s) were skipped during import. These rows likely had:
                      </p>
                      <ul className="text-sm text-light-dark space-y-1 list-disc list-inside">
                        <li>Empty or blank lines</li>
                        <li>Malformed data (wrong number of columns)</li>
                        <li>Invalid characters or encoding issues</li>
                        <li>Parsing errors that couldn't be recovered</li>
                      </ul>
                      <p className="text-sm text-dark font-medium mt-3">
                        ✓ Successfully imported: {importResult.actualLeads?.toLocaleString()} rows
                      </p>
                    </div>
                  )}

                  {importResult.actualLeads !== importResult.expectedLeads && (importResult.skippedRows || 0) === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-dark mb-2">⚠️ Possible Issues:</h4>
                      <ul className="text-sm text-light-dark space-y-1 list-disc list-inside">
                        <li>Incorrect delimiter selected (try a different one)</li>
                        <li>File encoding issues or corrupted data</li>
                        <li>CSV parsing configuration mismatch</li>
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    if (importResult.tableId) {
                      router.push(`/admin/tables/view/${importResult.tableId}`);
                    }
                  }}
                  className="flex-1 bg-dark-blue text-white rounded-lg px-4 py-3 font-medium hover:bg-opacity-90 transition-all"
                  disabled={!importResult.tableId}
                >
                  View Table
                </button>
                <button
                  onClick={() => {
                    setImportResult(null);
                    setFile(null);
                    setTableName("");
                    setDelimiter("Comma");
                    setColumns([]);
                    setColumnCount(0);
                    setLeadCount(0);
                    setSelectedDedupeColumns([]);
                    setSelectedTags([]);
                  }}
                  className="flex-1 border border-light-gray-3 text-dark rounded-lg px-4 py-3 font-medium hover:bg-light-gray-2 transition-all"
                >
                  Import Another Table
                </button>
                <button
                  onClick={() => router.push("/admin/tables")}
                  className="border border-light-gray-3 text-dark rounded-lg px-4 py-3 font-medium hover:bg-light-gray-2 transition-all"
                >
                  Back to Tables
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiTableLight />} label="Create New Table" />

      <div className="h-full bg-light-gray">
        <div className="flex flex-col">
          {/* Navigation */}
          <div className="flex items-center justify-start gap-2 px-8 py-4 border-b border-light-gray-3">
            <div
              onClick={() => router.push("/admin/tables")}
              className="flex items-center gap-1 border border-dark hover:border-dark-blue hover:text-dark-blue rounded-full px-4 py-2 cursor-pointer"
            >
              <GoArrowLeft />
              <span>Back to Tables</span>
            </div>
            <div
              onClick={handleSubmit}
              className="flex flex-row-reverse items-center gap-1 bg-dark-blue text-white rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-90 transition-all"
            >
              <PiCheckBold />
              <span>Create Table</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
              <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
                Table Information
              </div>
              <div className="flex flex-col gap-4 p-6">
                <Input
                  label="Table Name"
                  type="text"
                  value={tableName}
                  disabled={false}
                  onChange={(e) => {
                    setTableName(e.target.value);
                    setErrors({ ...errors, tableName: "" });
                  }}
                  error={errors.tableName}
                />

                <FileUpload
                  label="CSV File"
                  fileName={file?.name}
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={false}
                  handleClose={handleCloseFile}
                  error={errors.file}
                />

                <div className="flex flex-col gap-1">
                  <span className="text-dark text-left text-sm">Delimiter</span>
                  <div className="flex flex-wrap gap-2">
                    {delimiterOptions.map((option) => {
                      const delimiterSymbols: { [key: string]: string } = {
                        Comma: ",",
                        Tab: "\\t",
                        Semicolon: ";",
                        Pipe: "|",
                      };
                      const symbol = delimiterSymbols[option];
                      
                      return (
                        <button
                          key={option}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full border border-light-gray-3 cursor-pointer ${
                            delimiter === option ? "text-dark-blue border-dark-blue bg-light-blue" : "text-dark"
                          }`}
                          disabled={false}
                          onClick={() => setDelimiter(option)}
                        >
                          <IoMdRadioButtonOn
                            className={`text-xl ${
                              delimiter === option ? "text-dark-blue" : "text-light-gray-3"
                            }`}
                          />
                          <span>{option}</span>
                          <span className="text-xs bg-light-gray-2 px-2 py-0.5 rounded font-mono">
                            {symbol}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* File Info Display */}
                {file && columnCount > 0 && (
                  <div className="bg-light-gray-2 border border-light-gray-3 rounded-lg p-4">
                    <h4 className="font-semibold text-dark mb-2">File Preview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-light-dark">Columns:</span>
                        <p className="font-medium text-dark">{columnCount}</p>
                      </div>
                      <div>
                        <span className="text-light-dark">Total Rows in File:</span>
                        <p className="font-medium text-dark">{leadCount.toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedDedupeColumns.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-light-gray-3">
                        <p className="text-xs text-orange-600">
                          ⚠️ <strong>Note:</strong> Final lead count may be lower after deduplication. 
                          {dedupeMode === "file" && " Duplicates within this file will be removed."}
                          {dedupeMode === "database" && " Leads already in your database will be removed."}
                          {dedupeMode === "both" && " Both in-file and database duplicates will be removed."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Duplicate Detection */}
                {file && columns.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <label className="text-dark text-left text-sm font-medium">
                      Duplicate Detection
                      {selectedDedupeColumns.length > 0 && (
                        <span className="ml-2 bg-dark-blue text-white text-xs px-2 py-0.5 rounded-full">
                          {selectedDedupeColumns.length}
                        </span>
                      )}
                    </label>
                    <p className="text-xs text-light-dark">
                      Select column(s) to check for duplicate leads. Rows with matching values in these columns will be removed.
                    </p>

                    {/* Dedupe Mode Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-light-dark font-medium">Check duplicates:</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDedupeMode("file")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            dedupeMode === "file"
                              ? "bg-dark-blue text-white border-dark-blue"
                              : "bg-white text-dark border-light-gray-3 hover:border-dark-blue"
                          }`}
                        >
                          <IoMdRadioButtonOn
                            className={`text-lg ${
                              dedupeMode === "file" ? "text-white" : "text-light-gray-3"
                            }`}
                          />
                          <span>In this file only</span>
                        </button>
                        <button
                          onClick={() => setDedupeMode("database")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            dedupeMode === "database"
                              ? "bg-dark-blue text-white border-dark-blue"
                              : "bg-white text-dark border-light-gray-3 hover:border-dark-blue"
                          }`}
                        >
                          <IoMdRadioButtonOn
                            className={`text-lg ${
                              dedupeMode === "database" ? "text-white" : "text-light-gray-3"
                            }`}
                          />
                          <span>Against database tables</span>
                        </button>
                        <button
                          onClick={() => setDedupeMode("both")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            dedupeMode === "both"
                              ? "bg-dark-blue text-white border-dark-blue"
                              : "bg-white text-dark border-light-gray-3 hover:border-dark-blue"
                          }`}
                        >
                          <IoMdRadioButtonOn
                            className={`text-lg ${
                              dedupeMode === "both" ? "text-white" : "text-light-gray-3"
                            }`}
                          />
                          <span>Both</span>
                        </button>
                      </div>
                    </div>

                    {/* Column Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-light-dark font-medium">Select columns to match:</span>
                      <div className="flex flex-wrap gap-2">
                        {columns.map((column) => (
                          <button
                            key={column}
                            onClick={() => toggleDedupeColumn(column)}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              selectedDedupeColumns.includes(column)
                                ? "bg-dark-blue text-white border-dark-blue"
                                : "bg-white text-dark border-light-gray-3 hover:border-dark-blue"
                            }`}
                          >
                            {selectedDedupeColumns.includes(column) && (
                              <PiCheckBold className="inline mr-1" />
                            )}
                            {column}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedDedupeColumns.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-dark">
                          <strong>ℹ️ Deduplication settings:</strong>
                        </p>
                        <ul className="text-xs text-light-dark mt-1 space-y-1">
                          <li>• Columns: <strong>{selectedDedupeColumns.join(", ")}</strong></li>
                          <li>• Mode: <strong>
                            {dedupeMode === "file" && "Check within this file only"}
                            {dedupeMode === "database" && "Check against existing database tables"}
                            {dedupeMode === "both" && "Check within file AND against database"}
                          </strong></li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <TagSelector
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

