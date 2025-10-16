"use client";

import { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DateInputProps {
  label: string;
  value: Dayjs | null | undefined;
  disabled?: boolean;
  error?: string;
  onChange: (value: Dayjs | null) => void;
}

export default function DateInput({
  label,
  value,
  error,
  onChange,
}: DateInputProps) {
  return (
    <div className="w-full flex flex-col items-start">
      <label htmlFor={label} className="text-sm text-light-dark font-medium">
        {label}
      </label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker", "DatePicker"]}>
          <DatePicker
            value={value}
            onChange={(newValue) => onChange(newValue)}
          />
        </DemoContainer>
      </LocalizationProvider>
      {error && <span className="text-red text-xs">{error}</span>}
    </div>
  );
}
