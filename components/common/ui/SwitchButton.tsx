"use client";

interface SwitchButtonProps {
  value: boolean | undefined;
  disabled: boolean;
  onChange: () => void;
}

export default function SwitchButton({
  value,
  disabled,
  onChange,
}: SwitchButtonProps) {
  const handleChangeStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange();
  };
  return (
    <button
      onClick={(e) => handleChangeStatus(e)}
      disabled={disabled}
      className={`flex items-center ${
        value
          ? "justify-end bg-dark-blue border-dark-blue"
          : "justify-start bg-light-gray-3 border-light-gray-3"
      } h-5 w-10 min-w-8 px-1 border rounded-full cursor-pointer transition-all duration-200`}
    >
      <div
        className={`w-4 h-4 rounded-full ${
          value ? "bg-white" : "bg-white"
        }`}
      ></div>
    </button>
  );
}
