"use client";

import { useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";

interface CountryOption {
  value: string;
  label: string;
}

function CountrySelector({ setCountry, country }: { setCountry: (country: CountryOption | null) => void; country: CountryOption | null }) {
  const options: CountryOption[] = useMemo(() => countryList().getData(), []);

  const changeHandler = (selectedOption: CountryOption | null) => {
    setCountry(selectedOption);
  };

  return (
    <Select
      options={options}
      value={country}
      onChange={changeHandler}
      className="text-left focus-within:border-dark-blue"
    />
  );
}


export default CountrySelector;
