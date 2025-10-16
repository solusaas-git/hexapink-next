"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { Collection } from "@/types";

export default function ViewCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    try {
      const response = await api.get(`/admin/collections/${id}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink"></div>
      </div>
    );
  }

  if (!collection) {
    return <div className="p-8 text-center">Collection not found</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-kanit font-bold text-dark">{collection.title}</h1>
        <button
          onClick={() => router.push(`/admin/collections/${id}/edit`)}
          className="bg-pink text-white px-6 py-2 rounded-lg hover:bg-pink/90"
        >
          Edit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Type</h3>
          <p className="text-lg">{collection.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Description</h3>
          <p className="text-gray-700">{collection.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Fee</h3>
            <p className="text-lg">${collection.fee}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Discount</h3>
            <p className="text-lg">{collection.discount}%</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Status</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                collection.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {collection.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

