"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Components
import InputField from "@/components/auth/Login/InputField";
import LoginButton from "@/components/auth/Login/LoginButton";
import PasswordField from "@/components/auth/Login/PasswordField";
import CheckBox from "@/components/home/elements/desktop/CheckBox";

// Hooks
import { useUserContext } from "@/contexts/UserContext";
import api from "@/lib/api-client";

const initialErrors = {
  email: "",
  password: "",
};

export default function LoginPageMain() {
  const router = useRouter();
  const { login } = useUserContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayedConnected, setStayedConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState(initialErrors);

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrors({
        email: !email ? "Email is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }

    try {
      setLoading(true);
      setErrors(initialErrors);

      const response = await api.post("/auth/login", {
        email,
        password,
        stayedConnected,
      });

      if (response.data.user) {
        login(response.data.user);
        toast.success("Login successful!");
        
        // Redirect based on role
        if (response.data.user.role === "admin" || response.data.user.role === "manager") {
          router.push("/admin/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || "Account not verified");
        
        if (error.response.data.message?.includes("verify")) {
          // Handle resend verification if needed
          toast.info("Please check your email for verification link");
        }
      } else if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 items-center justify-between">
      <div className="lg:w-[80%] w-[90%] lg:mt-24 mt-10 flex flex-col gap-6">
        <h1 className="lg:text-[40px] text-[30px] text-left font-kanit font-bold text-dark">
          Welcome Back!
        </h1>
        <p className="text-left text-md lg:text-xl font-raleway font-medium text-light-dark">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-light-dark border-b-2 font-raleway font-semibold border-[#666666] hover:text-pink hover:border-pink transition-colors"
          >
            Register Now
          </Link>
        </p>
        <div className="2xl:w-[50%] lg:w-[75%] w-full flex flex-col justify-center items-center gap-2">
          <div 
            className="w-full flex lg:flex-row flex-col lg:justify-start lg:items-start gap-10 lg:mt-24 mt-10"
            onKeyPress={handleKeyPress}
          >
            <InputField
              type="text"
              title="EMAIL *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jaune.though@earth.planet"
              error={errors.email}
            />
            <PasswordField
              title="PASSWORD *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
            />
          </div>
          <div className="w-full flex sm:flex-row flex-col lg:justify-between justify-start lg:items-center items-start gap-10 mt-10">
            <CheckBox
              checked={stayedConnected}
              handleChange={() => setStayedConnected(!stayedConnected)}
              text="Stay connected"
            />
            <Link
              href="/forgot-password"
              className="text-dark font-raleway font-medium text-md lg:text-lg hover:text-pink transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="w-full flex sm:flex-row flex-col lg:justify-start justify-center lg:items-start items-center gap-10 mt-10 mb-10">
            <LoginButton onClick={handleSubmit}>
              {loading ? "Logging in..." : "Log in"}
            </LoginButton>
          </div>
        </div>
      </div>
    </div>
  );
}
