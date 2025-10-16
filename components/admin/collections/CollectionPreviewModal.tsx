"use client";

import React, { useEffect, useState, useCallback } from "react";
import Modal from "@/components/common/ui/Modal";
import Spinner from "@/components/common/ui/Spinner";
import api from "@/lib/api-client";

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
}

interface Collection {
  _id: string;
  title: string;
  type?: string;
  status: string;
  description?: string;
  fee: number;
  discount: number;
  countries?: string[];
  columns: Column[];
  createdAt: string;
}

interface CollectionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  collectionId: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const CollectionPreviewModal: React.FC<CollectionPreviewModalProps> = ({
  open,
  onClose,
  collectionId,
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/collections/${collectionId}`);
      setCollection(response.data);
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (open && collectionId) {
      fetchCollection();
    }
  }, [open, collectionId, fetchCollection]);

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-dark-blue">Collection Preview</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" color="#4040BF" />
          </div>
        ) : collection ? (
          <div>
            {/* Basic Info */}
            <div className="mb-6 pb-6 border-b border-light-gray-3">
              <h3 className="text-xl font-bold mb-3">{collection.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Type:</span> {collection.type || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      collection.status === "Active"
                        ? "bg-light-green-2 text-green"
                        : "bg-light-gray text-gray-600"
                    }`}
                  >
                    {collection.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Fee:</span> ${collection.fee || 0}
                </div>
                <div>
                  <span className="font-semibold">Discount:</span> {collection.discount || 0}%
                </div>
                <div>
                  <span className="font-semibold">Created At:</span> {formatDate(collection.createdAt)}
                </div>
                {collection.countries && collection.countries.length > 0 && (
                  <div>
                    <span className="font-semibold">Countries:</span>{" "}
                    {collection.countries.join(", ")}
                  </div>
                )}
              </div>
              {collection.description && (
                <div className="mt-3">
                  <span className="font-semibold">Description:</span>
                  <p className="text-gray-600 mt-1">{collection.description}</p>
                </div>
              )}
            </div>

            {/* Columns */}
            <div>
              <h4 className="text-lg font-bold mb-4">
                Columns ({collection.columns.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collection.columns.map((column) => (
                  <div
                    key={column.id}
                    className="p-4 border border-light-gray-3 rounded-lg bg-[#F7F7FC]"
                  >
                    <h5 className="font-semibold text-dark-blue mb-2">{column.name}</h5>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-semibold">Type:</span> {column.type}
                      </div>
                      <div>
                        <span className="font-semibold">Show to Client:</span>{" "}
                        {column.showToClient ? "Yes" : "No"}
                      </div>
                      <div>
                        <span className="font-semibold">Additional Fee:</span>{" "}
                        {column.isAdditionalFee ? `$${column.additionalFee}` : "N/A"}
                      </div>
                      {column.tableColumns && column.tableColumns.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold">Table Columns:</span>
                          <ul className="ml-4 mt-1 list-disc list-inside">
                            {column.tableColumns.map((tableColumn, idx) => (
                              <li key={idx} className="text-xs text-gray-600">
                                {tableColumn.tableName}: {tableColumn.tableColumn}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-10">
            No collection data available.
          </p>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CollectionPreviewModal;

