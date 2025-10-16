"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import PasswordField from "../Login/PasswordField";
import ResetPasswordButton from "./ResetPasswordButton";

interface ResetPasswordPageMainProps {
  token: string;
}

export default function ResetPasswordPageMain({ token }: ResetPasswordPageMainProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !passwordConfirm) {
      toast.error("Both password fields are required");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      toast.success(response.data.message || "Password reset successful");
      router.push("/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to reset password");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full lg:w-3/4 xl:w-1/2 px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 flex justify-between flex-col items-start gap-12">
      <div className="w-full lg:mt-24 mt-10 justify-start items-start flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-left lg:text-[40px] text-[30px] font-kanit font-bold text-dark">
            Reset Password
          </h1>
          <p className="text-left text-md lg:text-xl font-raleway font-medium text-light-dark">
            Enter your new password below.
          </p>
        </div>

        <PasswordField
          title="NEW PASSWORD *"
          placeholder="New Password"
          value={password}
          error=""
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          title="CONFIRM NEW PASSWORD *"
          placeholder="Confirm New Password"
          value={passwordConfirm}
          error=""
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <div className="w-full flex justify-start items-start gap-8">
          <ResetPasswordButton onClick={handleResetPassword}>
            <span>{loading ? "Resetting..." : "Reset Password"}</span>
          </ResetPasswordButton>
        </div>
      </div>
    </div>
  );
}

