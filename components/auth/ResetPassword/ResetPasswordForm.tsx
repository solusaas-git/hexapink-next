"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { toast } from "react-toastify";
import PasswordField from "../Login/PasswordField";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      if (response.status === 200) {
        toast.success("Password reset successfully");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-kanit font-bold text-dark mb-2">
        Reset Password
      </h1>
      <p className="text-gray-600 mb-6 font-raleway">
        Enter your new password
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
        />

        <PasswordField
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink text-white px-6 py-3 rounded-lg hover:bg-pink/90 transition-colors font-raleway disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

