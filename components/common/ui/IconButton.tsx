"use client";

interface IconButtonProps {
  label: String;
  icon: JSX.Element;
  className: String;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function IconButton({
  label,
  onClick,
  icon,
  className,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-dark-blue text-white flex items-center gap-2 rounded-full ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
