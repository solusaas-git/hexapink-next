"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"email" | "phone">("email");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query) {
      toast.error("Please enter a value to lookup");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/lookup", { query, type });
      setResult(response.data);
      toast.success("Lookup successful");
    } catch (error: any) {
      console.error("Lookup error:", error);
      toast.error(error.response?.data?.message || "Lookup failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-kanit font-bold text-dark">Look Up</h1>
        <p className="text-gray-600 mt-2 font-raleway">
          Search for email or phone number information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleLookup} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lookup Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={type === "email"}
                  onChange={() => setType("email")}
                  className="mr-2"
                />
                Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={type === "phone"}
                  onChange={() => setType("phone")}
                  className="mr-2"
                />
                Phone
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {type === "email" ? "Email Address" : "Phone Number"}
            </label>
            <div className="flex gap-2">
              <input
                type={type === "email" ? "email" : "tel"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink"
                placeholder={
                  type === "email" ? "Enter email address" : "Enter phone number"
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-pink text-white px-6 py-2 rounded-lg hover:bg-pink/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiSearch /> {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Results</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

