"use client";

import { useState, useEffect } from "react";
import { LiaSearchSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import Checkbox from "@/components/common/ui/Checkbox";
import Spinner from "@/components/common/ui/Spinner";

interface Country {
  _id: string;
  name: string;
  onSignUp: boolean;
  inApp: boolean;
}

export default function CountrySettings() {
  const [search, setSearch] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const filtered = countries.filter((country) =>
      country.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCountries(filtered);
    setCurrentPage(1);
  }, [search, countries]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/countries");
      setCountries(response.data);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, field: "onSignUp" | "inApp", value: boolean) => {
    try {
      const updatedCountry = countries.find((c) => c._id === id);
      if (!updatedCountry) return;

      await api.put(`/admin/countries/${id}`, {
        ...updatedCountry,
        [field]: value,
      });

      setCountries((prev) =>
        prev.map((country) =>
          country._id === id ? { ...country, [field]: value } : country
        )
      );

      toast.success(
        `${updatedCountry.name} ${field === "onSignUp" ? "Sign-Up" : "In-App"} status updated`
      );
    } catch (error) {
      console.error("Failed to update country:", error);
      toast.error("Failed to update country");
    }
  };

  const handleInitialize = async () => {
    if (!confirm("This will initialize all countries. Continue?")) return;

    try {
      await api.post("/admin/countries/initialize");
      toast.success("Countries initialized successfully");
      fetchCountries();
    } catch (error) {
      console.error("Failed to initialize countries:", error);
      toast.error("Failed to initialize countries");
    }
  };

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCountries = filteredCountries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white border border-light-gray-3 rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-dark">Country Settings</h3>
        <button
          onClick={handleInitialize}
          className="px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Initialize Countries
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <LiaSearchSolid className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="#4040BF" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7FC] border-b-2 border-light-gray-3">
                <tr>
                  <th className="p-3 text-left font-semibold">Country</th>
                  <th className="p-3 text-center font-semibold">On Sign-Up</th>
                  <th className="p-3 text-center font-semibold">In App</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCountries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-light-dark">
                      {search ? "No countries found" : "No countries available. Click Initialize Countries."}
                    </td>
                  </tr>
                ) : (
                  paginatedCountries.map((country) => (
                    <tr key={country._id} className="border-b border-light-gray-3">
                      <td className="p-3">{country.name}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={country.onSignUp}
                            onChange={(checked) => handleToggle(country._id, "onSignUp", checked)}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={country.inApp}
                            onChange={(checked) => handleToggle(country._id, "inApp", checked)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-light-gray-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray-2"
              >
                Previous
              </button>
              <span className="text-sm text-light-dark">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-light-gray-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

