import { toast } from "react-toastify";
import api from "./api";
import { User } from "@/types";

interface SignupData {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  industry: string;
  company: string;
  email: string;
  password: string;
  passwordConfirm: string;
  verificationCode?: string;
}

export interface Responsetype {
  message: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User
}

export const verifyEmail = async (
  email: string,
  otp: string,
  onSuccess: (data: Responsetype) => void
) => {
  try {
    const response = await api.post("/api/auth/verify-email", { email, otp });

    if (response.status === 200) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error verifying email:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      // Request was made but no response received
      toast.error("Error: No response from server. Please try again later.");
    } else {
      // Something else happened while setting up the request
      toast.error("Error: Unable to verify email. Please try again.");
    }
  }
};

export const requireResendCode = async (
  email: string,
  onSuccess: (data: Responsetype) => void
) => {
  try {
    const response = await api.post("/api/auth/resend-otp", { email });

    if (response.status === 200) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error verifying email:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      // Request was made but no response received
      toast.error("Error: No response from server. Please try again later.");
    } else {
      // Something else happened while setting up the request
      toast.error("Error: Unable to verify email. Please try again.");
    }
  }
};

export const signup = async (
  formData: SignupData,
  onSuccess: (data: Responsetype) => void,
  onError: (error: any) => void
) => {
  try {
    const response = await api.post("/api/auth/signup", formData);
    if (response.status === 201) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error signing up:", error);
    onError(error);
    // if (error.response) {
    //   // Server responded with a status other than 200 range
    //   toast.error(`Error: ${error.response.data.message}`);
    // } else if (error.request) {
    //   // Request was made but no response received
    //   alert("Error: No response from server. Please try again later.");
    // } else {
    //   // Something else happened while setting up the request
    //   alert("Error: Unable to sign up. Please try again.");
    // }
  }
};

export const handleLogin = async (
  email: string,
  password: string,
  onSuccess: (data: LoginResponse) => void,
  onError: (error: any) => void
) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    if (response.status === 200) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error logging in:", error);
    onError(error);    
  }
};

export const forgotPassword = async (
  email: string,
  onSuccess: (data: { message: string }) => void
) => {
  try {
    const response = await api.post("/api/auth/forgot-password", { email });
    if (response.status === 200) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error sending password reset link:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      // Request was made but no response received
      toast.error("Error: No response from server. Please try again later.");
    } else {
      // Something else happened while setting up the request
      toast.error(
        "Error: Unable to send password reset link. Please try again."
      );
    }
  }
};

export const resetPassword = async (
  token: string | undefined,
  password: string,
  onSuccess: (data: { message: string }) => void
) => {
  try {
    const response = await api.post("/api/auth/reset-password", {
      token,
      password,
    });
    if (response.status === 200) {
      onSuccess(response.data);
    }
  } catch (error: any) {
    console.error("Error resetting password:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      // Request was made but no response received
      toast.error("Error: No response from server. Please try again later.");
    } else {
      // Something else happened while setting up the request
      toast.error("Error: Unable to reset password. Please try again.");
    }
  }
};
