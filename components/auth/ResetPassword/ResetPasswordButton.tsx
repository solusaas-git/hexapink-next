"use client";

import React from "react";
import { MdLockReset } from "react-icons/md";

interface ResetPasswordButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const ResetPasswordButton: React.FC<ResetPasswordButtonProps> = ({
  onClick,
  children,
}) => {
  return (
    <div className="login-button border cursor-pointer" onClick={onClick}>
      <div className="flex justify-center items-center gap-2">
        <MdLockReset />
        {children}
      </div>
    </div>
  );
};

export default ResetPasswordButton;

