"use client";

import NextImage from "next/image";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaRegFolderOpen } from "react-icons/fa";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { IoCloseSharp } from "react-icons/io5";
import { CiCircleInfo } from "react-icons/ci";
import { PiTableLight } from "react-icons/pi";
import { IoMdRadioButtonOn } from "react-icons/io";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import TableMappingsModal from "@/components/admin/collections/TableMappingsModal";
import { getFullFileUrl } from "@/lib/utils/fileUtils";

const steps = [
  { name: "General", id: 1 },
  { name: "Columns", id: 2 },
  { name: "Tables", id: 3 },
  { name: "Steps", id: 4 },
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

interface Collection {
  _id: string;
  title: string;
  type: string;
  description: string;
  featured: boolean;
  countries: string[];
  fee: number;
  discount: number;
  columns: Column[];
  image?: string;
  mobileImage?: string;
}

export default function ViewCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMappingsModal, setShowMappingsModal] = useState(false);
  const [selectedColumnMappings, setSelectedColumnMappings] = useState<{
    columnName: string;
    mappings: { tableName: string; tableColumn: string }[];
  } | null>(null);
  const [selectedStepName, setSelectedStepName] = useState<string | null>(null);
  const [selectedTableForMapping, setSelectedTableForMapping] = useState<{
    _id: string;
    tableName: string;
  } | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      const response = await api.get(`/admin/collections/${id}`);
      console.log("Collection data:", response.data);
      console.log("Columns:", response.data.columns);
      console.log("Columns length:", response.data.columns?.length);
      setCollection(response.data);
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleClickBackStep = () => {
    if (step === 1) {
      router.push("/admin/collections");
    } else {
      setStep(step - 1);
    }
  };

  const handleClickNextStep = () => {
    if (step === steps.length) {
      router.push("/admin/collections");
    } else {
      setStep(step + 1);
    }
  };

  const handleViewMappings = (
    columnName: string,
    mappings: { tableName: string; tableColumn: string }[]
  ) => {
    setSelectedColumnMappings({ columnName, mappings });
    setShowMappingsModal(true);
  };

  const handleCloseMappingsModal = () => {
    setShowMappingsModal(false);
    setSelectedColumnMappings(null);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegFolderOpen />} label="View Collection" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegFolderOpen />} label="View Collection" />
        <div className="flex-1 flex items-center justify-center">
          <p>Collection not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<FaRegFolderOpen />} label="View Collection" />

      <div className="h-full flex bg-light-gray">
        {/* Sidebar with Steps */}
        <div className="border-r border-light-gray-1 px-12 py-8">
          <div className="flex flex-col gap-4">
            {steps.map((s) => (
              <div
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-3 cursor-pointer ${
                  step === s.id ? "text-dark-blue font-semibold" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step === s.id
                      ? "border-dark-blue bg-dark-blue text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {s.id}
                </div>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Navigation */}
          <div className="flex items-center justify-start gap-2 px-8 py-4 border-b border-light-gray-3">
            <div
              onClick={handleClickBackStep}
              className="flex items-center gap-1 border border-dark hover:border-dark-blue hover:text-dark-blue rounded-full px-4 py-2 cursor-pointer"
            >
              <GoArrowLeft />
              <span>{step === 1 ? "Back to Collections" : "Back"}</span>
            </div>
            <div
              onClick={handleClickNextStep}
              className={`flex items-center gap-1 border rounded-full px-4 py-2 cursor-pointer ${
                step === steps.length
                  ? "flex-row-reverse bg-dark-blue text-white"
                  : "border-dark hover:border-dark-blue hover:text-dark-blue"
              }`}
            >
              <span>{step === steps.length ? "Close" : "Next"}</span>
              {step === steps.length ? <IoCloseSharp /> : <GoArrowRight />}
            </div>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto p-8">
            {step === 1 && (
              <div className="flex flex-col gap-8">
                {/* General Information */}
                <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
                  <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
                    General Information
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 p-6">
                    <div className="flex flex-1 flex-col gap-4">
                      {/* Title */}
                      <div className="flex flex-col gap-2">
                        <label className="text-left font-semibold text-sm">Title</label>
                        <input
                          type="text"
                          value={collection.title}
                          disabled
                          className="px-4 py-2 border border-light-gray-3 rounded-lg bg-light-gray"
                        />
                      </div>

                      {/* Desktop Image */}
                      <div className="flex flex-col gap-2">
                        <label className="text-left font-semibold text-sm">Desktop Image</label>
                        {collection.image ? (
                          <div className="relative w-full h-32 border border-light-gray-3 rounded-lg overflow-hidden bg-light-gray">
                            <NextImage
                              src={getFullFileUrl(collection.image)}
                              alt="Desktop"
                              width={300}
                              height={128}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 border border-light-gray-3 rounded-lg bg-light-gray">
                            <span className="text-sm text-gray-400">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Mobile Image */}
                      <div className="flex flex-col gap-2">
                        <label className="text-left font-semibold text-sm">Mobile Image</label>
                        {collection.mobileImage ? (
                          <div className="relative w-full h-32 border border-light-gray-3 rounded-lg overflow-hidden bg-light-gray">
                            <NextImage
                              src={getFullFileUrl(collection.mobileImage)}
                              alt="Mobile"
                              width={300}
                              height={128}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 border border-light-gray-3 rounded-lg bg-light-gray">
                            <span className="text-sm text-gray-400">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div className="flex flex-col gap-2">
                        <label className="text-left font-semibold text-sm">Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={collection.type === "Particular"}
                              disabled
                              className="w-4 h-4"
                            />
                            <span>Particular</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={collection.type === "Business"}
                              disabled
                              className="w-4 h-4"
                            />
                            <span>Business</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      {/* Description */}
                      <div className="flex flex-col gap-2">
                        <label className="text-left font-semibold text-sm">Description</label>
                        <textarea
                          value={collection.description}
                          disabled
                          rows={8}
                          className="px-4 py-2 border border-light-gray-3 rounded-lg bg-light-gray resize-none"
                        />
                      </div>

                      {/* Featured */}
                      <div className="flex items-center gap-2">
                        <div className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                          collection.featured ? 'bg-dark-blue' : 'bg-gray-300'
                        }`}>
                          <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            collection.featured ? 'translate-x-6' : ''
                          }`} />
                        </div>
                        <span className={`text-left ${collection.featured ? 'text-dark-blue font-semibold' : ''}`}>
                          Featured
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country Select */}
                <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
                  <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
                    Country
                  </div>
                  <div className="p-4 flex flex-col justify-start gap-2">
                    <span className="font-bold text-left">Selected Countries:</span>
                    <div className="flex flex-wrap gap-2">
                      {collection.countries.map((country) => (
                        <div
                          key={country}
                          className="flex items-center gap-2 px-3 py-1 rounded-full border border-light-gray-3 bg-light-gray-1"
                        >
                          <span className="w-2 h-2 rounded-full bg-dark-blue" />
                          <span className="text-dark-blue">{country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
                  <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
                    Pricing
                  </div>
                  <div className="flex items-center gap-8 p-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-left font-semibold text-sm">Base Fee Per Lead</label>
                      <div className="flex items-center gap-2 px-4 py-2 border border-light-gray-3 rounded-lg bg-light-gray">
                        <span className="text-gray-600">$</span>
                        <span>{collection.fee}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-left font-semibold text-sm">Discount Maximum</label>
                      <div className="flex items-center gap-2 px-4 py-2 border border-light-gray-3 rounded-lg bg-light-gray">
                        <span className="text-gray-600">$</span>
                        <span>{collection.discount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                {!collection.columns || collection.columns.length === 0 ? (
                  <div className="bg-white rounded-lg border border-light-gray-1 p-8">
                    <p className="text-center text-gray-500">No columns configured for this collection.</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="w-full flex items-center gap-2">
                      <div className="w-6 h-6"></div>
                      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
                        <span className="w-[5%] p-2 flex">#</span>
                        <span className="w-[20%] p-2 flex">Column Name</span>
                        <span className="w-[12%] p-2 flex">Type</span>
                        <span className="w-[12%] p-2 flex">Show Client</span>
                        <span className="w-[10%] p-2 flex">Optional</span>
                        <span className="w-[13%] p-2 flex">Add. Fee</span>
                        <span className="w-[13%] p-2 flex">Step</span>
                        <span className="w-[15%] p-2 flex">Mappings</span>
                      </div>
                    </div>

                    {/* Rows */}
                    {collection.columns.map((column, index) => (
                      <div key={column.id} className="w-full flex items-center gap-2 text-light-dark">
                        <div className="w-6 h-6"></div>
                        <div className="w-full bg-[#F7F7FC] flex border border-light-gray-3 rounded-lg">
                          <div className="w-[5%] p-3 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center text-sm flex-shrink-0">
                              {index + 1}
                            </span>
                          </div>
                          <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span className="font-semibold truncate">{column.name}</span>
                          </div>
                          <div className="w-[12%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span className="truncate">{column.type}</span>
                          </div>
                          <div className="w-[12%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span className={`px-2 py-1 rounded-md text-xs ${
                              column.showToClient 
                                ? 'bg-light-green-2 text-green border border-light-green-1' 
                                : 'bg-light-gray text-gray-600 border border-light-gray-3'
                            }`}>
                              {column.showToClient ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span className={`px-2 py-1 rounded-md text-xs ${
                              column.optional 
                                ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                                : 'bg-light-gray text-gray-600 border border-light-gray-3'
                            }`}>
                              {column.optional ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="w-[13%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            {column.isAdditionalFee ? (
                              <span className="text-dark-blue font-semibold">${column.additionalFee}</span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                          <div className="w-[13%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            {column.stepName ? (
                              <span className="px-2 py-1 bg-light-gray rounded-md text-xs truncate">
                                {column.stepName}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                          <div className="w-[15%] p-3 flex items-center justify-between border-l border-dashed border-light-gray-3">
                            {column.tableColumns && column.tableColumns.length > 0 ? (
                              <>
                                <span className="text-xs text-dark-blue">
                                  {column.tableColumns.length} mapping{column.tableColumns.length > 1 ? 's' : ''}
                                </span>
                                <CiCircleInfo
                                  onClick={() => handleViewMappings(column.name, column.tableColumns || [])}
                                  className="text-lg border rounded-md p-0.5 box-content cursor-pointer flex-shrink-0 hover:bg-light-gray-3"
                                />
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="h-full flex text-dark">
                {/* Left Panel - Attached Tables */}
                <div className="w-96 flex flex-col gap-4 p-8">
                  <h2 className="text-left text-lg font-semibold">Attached Tables</h2>
                  <div className="flex flex-col gap-2">
                    {(() => {
                      // Get unique tables from all columns' tableColumns
                      const uniqueTables = new Map<string, { _id: string; tableName: string }>();
                      collection.columns.forEach((column) => {
                        column.tableColumns?.forEach((tc) => {
                          if (!uniqueTables.has(tc.tableId)) {
                            uniqueTables.set(tc.tableId, {
                              _id: tc.tableId,
                              tableName: tc.tableName,
                            });
                          }
                        });
                      });
                      const tables = Array.from(uniqueTables.values());
                      
                      return tables.length > 0 ? (
                        tables.map((table) => (
                          <div
                            key={table._id}
                            onClick={() => setSelectedTableForMapping(table)}
                            className="flex items-center gap-2 cursor-pointer rounded-lg"
                          >
                            <div className="w-full flex items-center gap-2">
                              <div
                                className={`relative flex flex-1 items-center gap-1 justify-between border px-3 py-2 rounded-lg ${
                                  selectedTableForMapping?._id === table._id
                                    ? "text-dark-blue bg-white border-dark-blue"
                                    : "bg-[#F7F7FC] border-light-gray-3"
                                }`}
                              >
                                <span className="text-sm font-medium truncate">{table.tableName}</span>
                                <span className="bg-light-gray-1 ml-auto rounded-md p-1 box-content text-xs text-dark-blue flex-shrink-0">
                                  Table-{table._id.slice(-5)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">
                          No tables attached
                        </p>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Panel - Column Mappings */}
                <div className="max-w-3xl h-full flex flex-1 flex-col gap-4 border-l border-light-gray-3 p-8">
                  <div className="flex items-center gap-2">
                    <h2 className="text-left text-lg font-semibold">Column Setting</h2>
                    {selectedTableForMapping && (
                      <span className="text-sm text-dark-blue bg-light-gray-2 px-3 py-1 rounded-full">
                        {selectedTableForMapping.tableName}
                      </span>
                    )}
                  </div>

                  {selectedTableForMapping ? (
                    <div className="flex flex-col gap-4">
                      {/* Header with wiring design */}
                      <div className="flex items-center">
                        <div className="relative flex flex-1 items-center justify-start gap-2 border border-light-gray-3 text-sm text-light-gray-3 rounded-lg p-2 z-0">
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

                      {/* Mappings with wiring */}
                      {collection.columns.map((column) => {
                        const mapping = column.tableColumns?.find(
                          (tc) => tc.tableId === selectedTableForMapping._id
                        );
                        const isMapped = !!mapping;
                        
                        return (
                          <div key={column.id} className="flex flex-col border border-light-gray-3 rounded-xl p-1">
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
                                  <div className="flex flex-1 p-2 items-center justify-between text-light-gray-3">
                                    <span className="text-sm">Not mapped</span>
                                  </div>
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
                      
                      {collection.columns.length === 0 && (
                        <p className="text-gray-500 text-center py-8">
                          No columns in collection
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">
                        Select a table from the left to view column mappings
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="h-full flex text-dark">
                {/* Left Panel - Steps List */}
                <div className="w-96 flex flex-col gap-4 p-6 border-r border-light-gray-1">
                  <h2 className="text-left text-lg font-semibold">Steps</h2>
                  <div className="flex flex-col gap-4">
                    {/* Steps from collection */}
                    <div className="flex flex-col gap-2">
                      {Array.from(
                        new Set(
                          collection.columns
                            .filter((c) => c.stepName)
                            .map((c) => c.stepName)
                        )
                      ).map((stepName) => (
                        <div
                          key={stepName}
                          onClick={() => setSelectedStepName(stepName || null)}
                          className="flex items-center gap-2 cursor-pointer rounded-lg"
                        >
                          <div className="w-full flex items-center gap-2">
                            <div
                              className={`relative flex flex-1 items-center justify-start gap-2 border p-2 rounded-lg ${
                                selectedStepName === stepName
                                  ? "text-dark-blue bg-white border-dark-blue"
                                  : "bg-[#F7F7FC] border-light-gray-3"
                              }`}
                            >
                              <span>{stepName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!collection.columns.some((c) => c.stepName) && (
                        <p className="text-gray-500 text-center py-4 text-sm">
                          No steps configured
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Step Details */}
                <div className="flex-1 flex flex-col gap-4 p-8 overflow-y-auto">
                  {selectedStepName ? (
                    <div className="flex flex-col gap-8">
                      <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
                        <div className="p-4 border-b border-dashed border-light-gray-1 text-left">
                          <h3 className="font-semibold">Step Name</h3>
                          <input
                            type="text"
                            value={selectedStepName}
                            disabled
                            className="w-full mt-2 p-2 border border-light-gray-3 rounded-lg bg-light-gray"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h2 className="text-left text-lg font-semibold">Step Columns</h2>
                        <div className="flex flex-col gap-2">
                          {collection.columns
                            .filter((c) => c.stepName === selectedStepName)
                            .map((column) => (
                              <div
                                key={column.id}
                                className="border border-light-gray-3 rounded-lg p-3 flex items-center justify-between gap-2 bg-[#F7F7FC]"
                              >
                                <div className="flex flex-1 items-center gap-4">
                                  <span className="flex-1 text-left font-medium">{column.name}</span>
                                  <span className="bg-light-gray-2 text-xs px-2 py-1 rounded">
                                    {column.type}
                                  </span>
                                </div>
                              </div>
                            ))}
                          {collection.columns.filter((c) => c.stepName === selectedStepName).length === 0 && (
                            <p className="text-gray-500 text-center py-8">
                              No columns in this step
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">
                        Select a step from the left to view its columns
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Mappings Modal */}
      {showMappingsModal && selectedColumnMappings && (
        <TableMappingsModal
          columnName={selectedColumnMappings.columnName}
          mappings={selectedColumnMappings.mappings}
          onClose={handleCloseMappingsModal}
        />
      )}
    </div>
  );
}

