import React, { useState, useEffect } from "react";
import { Search, X, MapPin, Check } from "lucide-react";
import api from "@/lib/api-client";
import * as flags from "country-flag-icons/react/3x2";

// Helper function to get country code from country name
const getCountryCode = (countryName: string): string => {
  const countryCodes: Record<string, string> = {
    // Europe
    "United Kingdom": "GB",
    "Germany": "DE",
    "France": "FR",
    "Spain": "ES",
    "Italy": "IT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Poland": "PL",
    "Ireland": "IE",
    "Portugal": "PT",
    "Austria": "AT",
    "Greece": "GR",
    "Luxembourg": "LU",
    "Czech Republic": "CZ",
    "Hungary": "HU",
    "Romania": "RO",
    "Bulgaria": "BG",
    "Croatia": "HR",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Estonia": "EE",
    "Latvia": "LV",
    "Lithuania": "LT",
    "Malta": "MT",
    "Cyprus": "CY",
    "Iceland": "IS",
    "Liechtenstein": "LI",
    "Monaco": "MC",
    "San Marino": "SM",
    "Vatican City": "VA",
    "Albania": "AL",
    "Andorra": "AD",
    "Belarus": "BY",
    "Bosnia and Herzegovina": "BA",
    "Kosovo": "XK",
    "Moldova": "MD",
    "Montenegro": "ME",
    "North Macedonia": "MK",
    "Serbia": "RS",
    "Ukraine": "UA",
    // North America
    "United States": "US",
    "Canada": "CA",
    "Mexico": "MX",
    // Middle East & North Africa
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Egypt": "EG",
    "Libya": "LY",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    "Qatar": "QA",
    "Kuwait": "KW",
    "Bahrain": "BH",
    "Oman": "OM",
    "Jordan": "JO",
    "Lebanon": "LB",
    "Israel": "IL",
    "Palestine": "PS",
    "Turkey": "TR",
    "Iran": "IR",
    "Iraq": "IQ",
    "Syria": "SY",
    "Yemen": "YE",
    // Asia
    "China": "CN",
    "Japan": "JP",
    "South Korea": "KR",
    "India": "IN",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Vietnam": "VN",
    "Thailand": "TH",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Indonesia": "ID",
    "Philippines": "PH",
    // Oceania
    "Australia": "AU",
    "New Zealand": "NZ",
    // South America
    "Brazil": "BR",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "Ecuador": "EC",
    "Uruguay": "UY",
    "Paraguay": "PY",
    "Bolivia": "BO",
    // Africa
    "South Africa": "ZA",
    "Nigeria": "NG",
    "Kenya": "KE",
    "Ghana": "GH",
    "Ethiopia": "ET",
    "Tanzania": "TZ",
    "Uganda": "UG",
    "Senegal": "SN",
    "Ivory Coast": "CI",
    "Cameroon": "CM",
  };
  return countryCodes[countryName] || "";
};

// Helper component to render country flag
const CountryFlag = ({ countryName, className = "" }: { countryName: string; className?: string }) => {
  const code = getCountryCode(countryName);
  if (!code) {
    return <MapPin className={className} size={20} />;
  }
  
  const FlagComponent = (flags as any)[code];
  if (!FlagComponent) {
    return <MapPin className={className} size={20} />;
  }
  
  return <FlagComponent className={className} />;
};

interface CountrySelectProps {
  selectedCountries: string[];
  setSelectedCountries: (countries: string[]) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  disabled?: boolean;
}

export default function CountrySelect({
  selectedCountries,
  setSelectedCountries,
  errors,
  setErrors,
  disabled = false,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        // Fetch countries from available collections
        const response = await api.get("/collection/countries");
        const fetchedCountries = response.data;
        
        if (fetchedCountries && fetchedCountries.length > 0) {
          setCountries(fetchedCountries);
          setSearchResults(fetchedCountries.slice(0, 10));
        } else {
          // Fallback if no collections exist
          const fallbackCountries = [
            { _id: "1", name: "United States", code: "US", inApp: true },
            { _id: "2", name: "United Kingdom", code: "GB", inApp: true },
            { _id: "3", name: "France", code: "FR", inApp: true },
          ];
          setCountries(fallbackCountries);
          setSearchResults(fallbackCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to common countries on error
        const fallbackCountries = [
          { _id: "1", name: "United States", code: "US", inApp: true },
          { _id: "2", name: "United Kingdom", code: "GB", inApp: true },
          { _id: "3", name: "France", code: "FR", inApp: true },
        ];
        setCountries(fallbackCountries);
        setSearchResults(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (search) {
      const results = countries.filter((country) =>
        country.name.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results.slice(0, 10));
    } else {
      setSearchResults(countries.slice(0, 10));
    }
  }, [search, countries]);

  const handleToggleCountry = (countryName: string) => {
    if (disabled) return;
    
    if (selectedCountries.includes(countryName)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== countryName));
    } else {
      setSelectedCountries([...selectedCountries, countryName]);
    }
    setErrors({ ...errors, countries: "" });
  };

  const handleRemoveCountry = (countryName: string) => {
    if (disabled) return;
    setSelectedCountries(selectedCountries.filter((c) => c !== countryName));
  };

  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
        Countries
      </div>

      {/* Selected Countries */}
      {selectedCountries.length > 0 && (
        <div className="p-4 border-b border-dashed border-light-gray-1 flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <div
              key={country}
              className="flex items-center gap-2 px-3 py-1.5 bg-dark-blue/10 text-dark-blue rounded-full border border-dark-blue"
            >
              <div className="rounded-sm overflow-hidden">
                <CountryFlag countryName={country} className="w-5 h-4 block" />
              </div>
              <span className="text-sm font-medium">{country}</span>
              <button
                onClick={() => handleRemoveCountry(country)}
                disabled={disabled}
                className="hover:bg-dark-blue/20 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available Countries as Badges */}
      <div className="p-4 border-b border-dashed border-light-gray-1">
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <div className="w-full text-center py-4 text-gray-500 text-sm">
              Loading countries...
            </div>
          ) : countries.filter((c) => !selectedCountries.includes(c.name)).length === 0 ? (
            <div className="w-full text-center py-4 text-gray-500 text-sm">
              {selectedCountries.length > 0 ? "All countries selected" : "No countries available"}
            </div>
          ) : (
            countries.filter((c) => !selectedCountries.includes(c.name)).map((country) => {
              return (
                <button
                  key={country._id}
                  onClick={() => handleToggleCountry(country.name)}
                  disabled={disabled}
                  style={{
                    border: "2px solid #4040BF",
                    backgroundColor: "#ffffff",
                    color: "#1a1a1a",
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = "#4040BF";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.border = "2px solid #4040BF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#1a1a1a";
                      e.currentTarget.style.border = "2px solid #4040BF";
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="border border-gray-400/30 rounded-sm overflow-hidden">
                    <CountryFlag countryName={country.name} className="w-6 h-4 block" />
                  </div>
                  <span className="text-sm font-medium">{country.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative flex items-center gap-2 p-3 border border-light-gray-3 rounded-lg focus-within:border-dark-blue transition-colors">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none disabled:cursor-not-allowed"
          />
        </div>

        {/* Search Dropdown */}
        {showDropdown && search && !disabled && (
          <div className="absolute z-10 mt-2 w-full max-w-2xl bg-white border border-light-gray-3 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No countries found</div>
            ) : (
              searchResults.map((country) => {
                const isSelected = selectedCountries.includes(country.name);
                return (
                  <button
                    key={country._id}
                    onClick={() => {
                      handleToggleCountry(country.name);
                      setSearch("");
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-light-gray-1 transition-colors text-left ${
                      isSelected ? "bg-dark-blue/5" : ""
                    }`}
                  >
                    <div className="border-2 border-gray-400 rounded-sm overflow-hidden shadow-sm">
                      <CountryFlag countryName={country.name} className="w-6 h-4 block" />
                    </div>
                    <span className={isSelected ? "font-semibold text-dark-blue" : ""}>
                      {country.name}
                    </span>
                    {isSelected && (
                      <Check className="ml-auto text-dark-blue" size={18} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {errors.countries && (
        <div className="px-4 pb-4 text-red-600 text-sm">{errors.countries}</div>
      )}

      {/* Close dropdown on outside click */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

