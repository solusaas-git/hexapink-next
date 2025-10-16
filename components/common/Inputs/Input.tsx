"use client";

interface InputProps {
  label: string;
  type?: string;
  value: string | undefined;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  type,
  value,
  disabled,
  error,
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1 items-start">
      <label htmlFor={label} className="text-sm text-light-dark font-medium">
        {label}
      </label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        type={type || "text"}
        disabled={disabled ?? false}
        placeholder={placeholder}
        className="w-full text-dark-blue font-bold bg-white border border-light-gray-3 focus:border-dark-blue rounded-lg p-2 transition duration-200 outline-none"
      />
      {error && <span className="text-red text-xs">{error}</span>}
    </div>
  );
}
