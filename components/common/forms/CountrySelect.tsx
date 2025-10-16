"use client";

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6"; // Import arrow icons
import { IoMdRadioButtonOn } from "react-icons/io";
import { LiaSearchSolid } from "react-icons/lia";
import { IoClose } from "react-icons/io5";
import countriesData from "world-countries";

import LoadingElement from "../ui/LoadingElement";
import api from "@/lib/api-client";

interface CountrySelectProps {
  selectedCountries: string[];
  disabled?: boolean;
  error: string;
  setErrors: (error: string) => void;
  setSelectedCountries: (countries: string[]) => void;
}

export default function CountrySelect({
  selectedCountries,
  disabled,
  error,
  setErrors,
  setSelectedCountries,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showAllCountries, setShowAllCountries] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch disabled countries in app
    async function fetchDisabledCountries() {
      try {
        const response = await api.get("/countries/disabled");
        return response.data;
      } catch (error) {
        console.error("Error fetching disabled countries:", error);
        return [];
      }
    }

    fetchDisabledCountries().then((disabledCountries) => {
      const countryNames: string[] = countriesData.map((country: { name: { common: string } }) => country.name.common); // Extract country names
      const filteredCountries = countryNames.filter(
        (country) => !disabledCountries.includes(country)
      );
      setCountries(filteredCountries);
      setLoading(false);
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (search) {
      const results = countries.filter((country) =>
        country.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
    } else if (showAllCountries) {
      setSearchResults(countries);
    } else {
      setSearchResults(countries.slice(0, 10));
    }
  }, [search, countries, showAllCountries]);

  const handleClickSearchedCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
      setErrors("");
    }
  };

  const toggleShowAllCountries = () => {
    setShowAllCountries((prev) => !prev);
  };

  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-raleway font-bold">
        Country
      </div>
      <div className="p-4 border-b border-dashed border-light-gray-1 flex items-center justify-start gap-2">
        <div className="flex items-center gap-4 p-2 border border-light-gray-3 rounded-lg">
          <LiaSearchSolid />
          <input
            type="text"
            id="country-search"
            name="country-search"
            placeholder="Search Countries"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="bg-transparent border-none outline-none"
          />
        </div>
        <button
          onClick={toggleShowAllCountries}
          className="ml-auto px-2 py-1 border flex items-center rounded-full text-dark"
        >
          {showAllCountries ? (
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
          )}
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2 p-6 border-b border-dashed border-light-gray-1">
        {loading ? (
          <div>
            <LoadingElement width="24" color="#4040BF" />
          </div>
        ) : (
          searchResults.map((country) => (
            <button
              key={country}
              onClick={() => handleClickSearchedCountry(country)}
              disabled={disabled}
              className="flex items-center gap-2 px-2 py-1 rounded-full border border-light-gray-3 cursor-pointer hover:bg-light-gray-1"
            >
              <IoMdRadioButtonOn className="text-light-gray-3" />
              {country}
            </button>
          ))
        )}
        {error && <span className="text-red text-xs mt-2">{error}</span>}
      </div>

      <div className="p-4 flex flex-col justify-start gap-2">
        <span className="font-bold text-left">Selected Countries:</span>
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <div
              key={country}
              className="flex items-center gap-2 px-2 py-1 rounded-full border border-light-gray-3 bg-light-gray-1"
            >
              <IoMdRadioButtonOn className="text-dark-blue" />
              <span className="text-dark-blue">{country}</span>
              <button
                onClick={() => handleClickSearchedCountry(country)}
                className="w-4 h-4 text-red border border-light-gray-3 rounded-full p-1 box-content"
                disabled={disabled}
              >
                <IoClose />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
