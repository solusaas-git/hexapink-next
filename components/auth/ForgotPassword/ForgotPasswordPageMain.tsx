"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import VerifyEmailButton from "./VerifyEmailButton";
import InputField from "../Login/InputField";

export default function ForgotPasswordPageMain() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post("/auth/forgot-password", { email });
      if (response.status === 200) {
        toast.success(response.data.message || "Password reset link sent to your email");
      }
    } catch (error: any) {
      console.error("Error sending password reset link:", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        toast.error("Error: No response from server. Please try again later.");
      } else {
        toast.error("Error: Unable to send password reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 flex justify-between flex-col gap-12 items-start">
      <div className="lg:mt-24 mt-10 justify-start items-start flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-left lg:text-[40px] text-[30px] font-kanit font-bold text-dark">
            Forgot Password
          </h1>
          <p className="text-left text-md lg:text-xl font-raleway font-medium text-light-dark">
            Enter your email address to receive a password reset link.
          </p>
        </div>
        <InputField
          type="email"
          title="EMAIL *"
          placeholder="your.email@example.com"
          value={email}
          error=""
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="w-full lg:flex justify-start items-start gap-8 hidden">
          <VerifyEmailButton onClick={handleForgotPassword}>
            <span>{loading ? "Sending..." : "Verify Email"}</span>
          </VerifyEmailButton>
        </div>
      </div>
      <div className="flex justify-center items-center lg:hidden gap-5 py-4">
        <VerifyEmailButton onClick={handleForgotPassword}>
          <span>{loading ? "Sending..." : "Verify Email"}</span>
        </VerifyEmailButton>
      </div>
    </div>
  );
}

