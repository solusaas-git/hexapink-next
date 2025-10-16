"use client";

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  error?: string;
  rows?: number;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({ label, placeholder, value, disabled, error, rows, onChange }: TextAreaProps) {
  return (
    <div className="w-full h-full flex flex-col items-start">
      <label htmlFor={label} className="text-md text-light-dark font-medium">
        {label}
      </label>
      <textarea
        id={label}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className="w-full h-full min-h-16 bg-white border border-light-gray-3 focus:border-dark-blue rounded-lg p-2 transition duration-200 outline-none"
      />
      {error && <span className="text-red text-sm">{error}</span>}
    </div>
  );
}
