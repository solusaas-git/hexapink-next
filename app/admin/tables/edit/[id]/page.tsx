"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiTableLight } from "react-icons/pi";
import { GoArrowLeft } from "react-icons/go";
import { PiCheckBold } from "react-icons/pi";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import Input from "@/components/common/Inputs/Input";
import TagSelector from "@/components/common/forms/TagSelector";
import api from "@/lib/api-client";
import { toast } from "react-toastify";

interface TableData {
  _id: string;
  tableName: string;
  columns: string[];
  leads: number;
  tags: string[];
  file: string;
  delimiter: string;
  createdAt: string;
}

interface TableErrors {
  tableName: string;
  tags: string;
}

export default function EditTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [tableName, setTableName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [leads, setLeads] = useState(0);
  const [delimiter, setDelimiter] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<TableErrors>({
    tableName: "",
    tags: "",
  });

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await api.get<TableData>(`/admin/tables/${id}`);
        const data = response.data;
        setTableName(data.tableName);
        setSelectedTags(data.tags || []);
        setColumns(data.columns || []);
        setLeads(data.leads);
        setDelimiter(data.delimiter);
        setCreatedAt(data.createdAt);
      } catch (error) {
        console.error("Error fetching table:", error);
        toast.error("Failed to load table data.");
        router.push("/admin/tables");
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [id, router]);

  const handleUpdate = async () => {
    // Validation
    if (!tableName.trim()) {
      setErrors((prev) => ({ ...prev, tableName: "Table name is required" }));
      toast.error("Table name is required");
      return;
    }

    const updateData: any = {
      tableName,
      tags: selectedTags,
    };

    setSaving(true);
    try {
      await api.patch(`/admin/tables/${id}`, updateData);
      toast.success("Table updated successfully");
      router.push("/admin/tables");
    } catch (error: any) {
      console.error("Error updating table:", error);
      toast.error(error.response?.data?.message || "Failed to update table");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiTableLight />} label="Edit Table" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiTableLight />} label="Edit Table" />

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
              onClick={handleUpdate}
              className="flex flex-row-reverse items-center gap-1 bg-dark-blue text-white rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-90 transition-all"
            >
              <PiCheckBold />
              <span>Update Table</span>
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
                  disabled={saving}
                  onChange={(e) => {
                    setTableName(e.target.value);
                    setErrors({ ...errors, tableName: "" });
                  }}
                  error={errors.tableName}
                />

                <TagSelector
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  disabled={saving}
                />

                {/* Read-only information */}
                <div className="bg-light-gray-2 border border-light-gray-3 rounded-lg p-4">
                  <h4 className="font-semibold text-dark mb-3">File Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-light-dark">Delimiter:</span>
                      <p className="font-medium text-dark capitalize">
                        {delimiter}{" "}
                        <span className="text-xs bg-white px-2 py-0.5 rounded font-mono border border-light-gray-3">
                          {delimiter === "comma" ? "," : delimiter === "tab" ? "\\t" : delimiter === "semicolon" ? ";" : "|"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-light-dark">Columns:</span>
                      <p className="font-medium text-dark">{columns.length}</p>
                    </div>
                    <div>
                      <span className="text-light-dark">Leads:</span>
                      <p className="font-medium text-dark">{leads.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-light-dark">Created At:</span>
                      <p className="font-medium text-dark">{new Date(createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

