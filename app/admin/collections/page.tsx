"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaRegFolderOpen } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { PiPlusCircle } from "react-icons/pi";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import AdminHeader from "@/components/admin/AdminHeader";
import Pagination from "@/components/common/ui/Pagination";
import Spinner from "@/components/common/ui/Spinner";
import CollectionListHeader from "@/components/admin/collections/CollectionListHeader";
import { CollectionListItem } from "@/components/admin/collections/CollectionListItem";

interface Collection {
  _id: string;
  title: string;
  image?: string;
  type?: string;
  countries?: string[];
  fee: number;
  status: "Active" | "Inactive";
  featured: boolean;
  createdAt: string;
  columns?: number;
}

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/collections");
      setFilteredCollections(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (index: string) => {
    setSelectedCollections((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((colIndex) => colIndex !== index)
        : [...prevSelected, index]
    );
  };

  const handleStatusChange = async (collectionId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/collections/${collectionId}`, { status: newStatus });
      toast.success("Status updated");
      fetchCollections();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleFeaturedChange = async (collectionId: string, featured: boolean) => {
    try {
      await api.patch(`/admin/collections/${collectionId}`, { featured });
      toast.success("Featured status updated");
      fetchCollections();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (collectionId: string) => {
    try {
      await api.delete(`/admin/collections/${collectionId}`);
      toast.success("Collection deleted");
      fetchCollections();
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<FaRegFolderOpen />} label="Collections" />

      <div className="h-full bg-light-gray border-b border-light-gray-1 flex">
        <div className="flex flex-col flex-1 border-r border-light-gray-1">
          <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
            {selectedCollections.length > 0 && (
              <span>{selectedCollections.length} Selected</span>
            )}
            <div className="ml-auto flex items-center divide-x">
              <div className="pr-4 flex items-center gap-2">
                {filteredCollections.length > 0 && (
                  <span>{filteredCollections.length} Results</span>
                )}
                <button className="flex items-center border border-light-gray-3 rounded-md px-2 py-1 text-dark cursor-pointer">
                  <CiFilter />
                  <span>Filter</span>
                </button>
              </div>
              <div className="pl-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  rowsPerPage={itemsPerPage}
                  pageSizeOptions={pageSizeOptions}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </div>

          {/* New Collection Button */}
          <div className="px-8 py-4 flex justify-center">
            <button
              onClick={() => router.push("/admin/collections/new")}
              className="w-full max-w-2xl bg-white border-2 border-dashed border-light-gray-3 rounded-lg p-4 flex items-center justify-center gap-2 text-dark-blue hover:border-dark-blue transition-colors cursor-pointer"
            >
              <PiPlusCircle className="text-2xl" />
              <span className="font-semibold">Create New Collection</span>
            </button>
          </div>

          <div className="p-8 flex flex-col gap-4">
            <CollectionListHeader />
            {loading ? (
              <div className="w-full h-full flex items-center justify-center py-20">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : (
              currentCollections.map((collection) => (
                <CollectionListItem
                  data={collection}
                  key={collection._id}
                  index={collection._id}
                  isSelected={selectedCollections.includes(collection._id)}
                  onCheckboxChange={handleCheckboxChange}
                  onStatusChange={handleStatusChange}
                  onFeaturedChange={handleFeaturedChange}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
