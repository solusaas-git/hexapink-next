import NextImage from "next/image";
import React, { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronUp, MapPin, Users, Database, DollarSign } from "lucide-react";
import api from "@/lib/api-client";
import Spinner from "@/components/common/ui/Spinner";
import type { Collection } from "@/types/orderBuilder";

interface CollectionSelectProps {
  type: string;
  countries: string[];
  selectedCollection: Collection | undefined;
  setSelectedCollection: (collection: Collection) => void;
  disabled?: boolean;
}

export default function CollectionSelect({
  type,
  countries,
  selectedCollection,
  setSelectedCollection,
  disabled = false,
}: CollectionSelectProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchResults, setSearchResults] = useState<Collection[]>([]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!type || countries.length === 0) {
        setCollections([]);
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.post("/collection/one", {
          type,
          countries,
        });
        setCollections(response.data);
        setSearchResults(response.data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections([]);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [type, countries]);

  useEffect(() => {
    if (search) {
      const results = collections.filter((collection) =>
        collection.title.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(showAllCollections ? results : results.slice(0, 10));
    } else {
      setSearchResults(showAllCollections ? collections : collections.slice(0, 10));
    }
  }, [search, collections, showAllCollections]);

  const toggleShowAllCollections = () => {
    setShowAllCollections((prev) => !prev);
  };

  const handleSelectCollection = (collection: Collection) => {
    if (disabled) return;
    // Toggle selection: if already selected, deselect it
    if (selectedCollection?._id === collection._id) {
      setSelectedCollection(undefined as any);
    } else {
      setSelectedCollection(collection);
    }
  };

  if (countries.length === 0) {
    return (
      <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
        <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
          Collections
        </div>
        <div className="p-8 text-center text-gray-500">
          <Database className="mx-auto mb-4 text-gray-400" size={48} />
          <p>Please select at least one country to view collections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
        Collections
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-dashed border-light-gray-1 flex items-center justify-start gap-2">
        <div className="flex items-center gap-4 p-2 border border-light-gray-3 rounded-lg flex-1">
          <Search className="text-gray-400" size={20} />
          <input
            id="collection-search"
            name="collection-search"
            type="text"
            placeholder="Search Collections"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="bg-transparent border-none outline-none flex-1 disabled:cursor-not-allowed"
          />
        </div>
        {collections.length > 10 && (
          <button
            onClick={toggleShowAllCollections}
            disabled={disabled}
            className="ml-auto px-4 py-2 border border-light-gray-3 flex items-center gap-2 rounded-full text-dark hover:border-dark-blue transition-colors disabled:cursor-not-allowed"
          >
            {showAllCollections ? (
              <>
                <ChevronUp size={16} />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Show All ({collections.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Collections List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" color="#4040BF" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Database className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No collections found</p>
            {search && (
              <p className="text-sm mt-2">Try adjusting your search</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {searchResults.map((collection) => {
              const isSelected = selectedCollection?._id === collection._id;
              return (
                <button
                  key={collection._id}
                  onClick={() => handleSelectCollection(collection)}
                  disabled={disabled}
                  style={{
                    border: isSelected ? "2px solid #D9D9F2" : "2px solid #D9D9F2",
                    backgroundColor: isSelected ? "#FBFBFE" : "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && !isSelected) {
                      e.currentTarget.style.border = "2px solid #4040BF";
                      e.currentTarget.style.backgroundColor = "#FBFBFE";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disabled && !isSelected) {
                      e.currentTarget.style.border = "2px solid #D9D9F2";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                  className={`w-full text-left p-5 rounded-lg transition-all shadow-sm hover:shadow-md group relative ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Checkmark badge like cart counter */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 bg-dark-blue rounded-full shadow-lg border-2 border-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-5">
                    {/* Collection Image */}
                    <div className="flex-shrink-0">
                      {collection.mobileImage || collection.image ? (
                        <NextImage
                          src={
                            (collection.mobileImage || collection.image)?.startsWith('/') || 
                            (collection.mobileImage || collection.image)?.startsWith('http')
                              ? (collection.mobileImage || collection.image)!
                              : `/${collection.mobileImage || collection.image}`
                          }
                          alt={collection.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink to-purple-600 flex items-center justify-center">
                          <Database className="text-white" size={36} />
                        </div>
                      )}
                    </div>

                    {/* Collection Details */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className={`font-bold text-xl transition-colors ${isSelected ? "text-dark-blue" : "text-dark group-hover:text-dark-blue"}`}>
                            {collection.title}
                          </h3>
                        </div>

                        {/* Collection Info */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                            isSelected 
                              ? "bg-dark-blue text-white" 
                              : "bg-gray-100 text-gray-700 group-hover:bg-dark-blue/10 group-hover:text-dark-blue"
                          }`}>
                            <Users size={12} />
                            {collection.type}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                            isSelected ? "text-gray-700" : "text-gray-600 group-hover:text-gray-700"
                          }`}>
                            <MapPin size={14} className="flex-shrink-0" />
                            <span className="font-medium">{collection.countries.join(", ")}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                            isSelected ? "text-gray-700" : "text-gray-600 group-hover:text-gray-700"
                          }`}>
                            <Database size={14} className="flex-shrink-0" />
                            <span className="font-medium">{collection.columns?.length || 0} columns</span>
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg font-bold text-base transition-all ${
                          isSelected 
                            ? "bg-green text-white" 
                            : "bg-green/10 text-green group-hover:bg-green group-hover:text-white"
                        }`}>
                          <DollarSign size={14} />
                          {collection.fee}
                          <span className="text-xs opacity-80">/lead</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

