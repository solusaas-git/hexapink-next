"use client";

import { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import countries from "world-countries";

interface Country {
  id: number;
  name: string;
  code: string;
  phone: string;
}

const countryArray: Country[] = countries.map((country, index) => ({
  id: index + 1,
  name: country.name.common,
  code: country.cca2,
  phone:
    country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ""),
}));

interface CountryCodeDropdownProps {
  countryName: string;
  error: string;
  setPhoneNumber: (phoneNumber: string) => void;
}

export default function CountryCodeDropdown({
  countryName,
  error,
  setPhoneNumber,
}: CountryCodeDropdownProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const country = countryArray.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    if (country) {
      setSelectedCountry(country);
    }
  }, [countryName]);

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

  const filteredCountries =
    query === ""
      ? countryArray
      : countryArray.filter(
          (country) =>
            country.name.toLowerCase().includes(query.toLowerCase()) ||
            country.phone.includes(query) ||
            country.code.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div style={{ width: "100%" }}>
      <div className="focus-within:text-pink">
        <label
          htmlFor="phone-number-input"
          className="block text-sm text-start font-raleway"
        >
          PHONE *
        </label>
        <div className="flex justify-center items-bottom">
          <div className="relative mt-2" ref={dropdownRef}>
            <input
              type="text"
              className="peer block w-[100px] font-raleway font-medium bg-transparent py-1.5 pl-3 pr-12 text-base text-gray-900 placeholder:text-gray-400 border-b border-gray-300 focus:border-pink focus:outline-none sm:text-sm"
              value={selectedCountry ? selectedCountry.phone : ""}
              placeholder="Select country"
              onFocus={() => setIsOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none bg-transparent hover:bg-transparent hover:border-none outline-none border-none text-2xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              <MdKeyboardArrowDown />
            </button>

            {isOpen && filteredCountries.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {filteredCountries.map((country) => (
                  <li
                    key={country.id}
                    onClick={() => {
                      setSelectedCountry(country);
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:text-pink"
                  >
                    <span className="block font-raleway font-medium text-left">
                      {country.phone}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            id="phone-number-input"
            type="text"
            inputMode="numeric"
            name="phone-number"
            pattern="[0-9]*"
            onKeyPress={(event) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(event) => {
              setPhoneNumber(selectedCountry?.phone + event.target.value);
            }}
            className="bg-transparent block w-full border-gray-300 text-[15px] font-raleway font-medium border-b focus:outline-none focus-within:border-pink p-0 m-0 leading-none align-bottom"
          />
        </div>

        {error && <p className="text-red text-sm mt-2 text-left">{error}</p>}
      </div>
    </div>
  );
}
