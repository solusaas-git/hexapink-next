"use client";

import { useState, useEffect, useRef } from "react";
import countriesData from "world-countries";

import { MdKeyboardArrowDown } from "react-icons/md";

import api from "@/lib/api-client";

interface CountryDropdownProps {
  country: string;
  error: string;
  onCountrySelect: (country: string) => void;
}

const CountryDropdown = ({
  country,
  onCountrySelect,
  error,
}: CountryDropdownProps) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [query, setQuery] = useState(country);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch disabled countries in app
    async function fetchDisabledCountries() {
      try {
        const response = await api.get("/countries/signup-disabled");
        return response.data;
      } catch (error) {
        console.error("Error fetching disabled countries:", error);
        return [];
      }
    }

    fetchDisabledCountries().then((disabledCountries) => {
      const countryNames: string[] = countriesData.map(
        (country: { name: { common: string } }) => country.name.common
      );
      const filteredCountries = countryNames.filter(
        (country) => !disabledCountries.includes(country)
      );
      setCountries(filteredCountries);
    });
  }, []);

  useEffect(() => {
    if (query) {
      const results = countries.filter((country) =>
        country.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(results);
      setIsOpen(true);
      if (countries.includes(query)) {
        onCountrySelect(query);
      } else {
        onCountrySelect("");
      }
    } else {
      setFilteredCountries(countries);
      onCountrySelect("");
    }
  }, [query, countries, onCountrySelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: string) => {
    onCountrySelect(country);
    setQuery(country);
    setIsOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <label
        htmlFor="country-select"
        className="block text-sm font-raleway text-start"
      >
        COUNTRY *
      </label>
      <div className="relative mt-2" ref={dropdownRef}>
        <input
          id="country-select"
          type="text"
          className="peer block w-full font-raleway font-medium bg-transparent py-1.5 pr-12 text-base text-gray-900 placeholder:text-gray-400 border-b border-gray-300 focus:border-pink focus:outline-none sm:text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Select a country"
        />
        <button
          type="button"
          className="bg-transparent text-2xl absolute top-2 right-0 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MdKeyboardArrowDown />
        </button>

        {isOpen && filteredCountries.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredCountries.map((country) => (
              <li
                key={country}
                className="w-full text-left cursor-pointer select-none px-4 py-2 text-gray-900 hover:text-pink"
                onClick={() => handleCountrySelect(country)}
              >
                {country}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-red text-sm mt-2 text-left">{error}</p>}
    </div>
  );
};

export default CountryDropdown;
