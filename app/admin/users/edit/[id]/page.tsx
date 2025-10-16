"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PiUserCircleLight } from "react-icons/pi";
import { IoArrowBack } from "react-icons/io5";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import Input from "@/components/common/Inputs/Input";
import Selection from "@/components/common/forms/Selection";
import { toast } from "react-toastify";

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("Active");
  const [balance, setBalance] = useState("0");
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get(`/admin/users/${params.id}`);
      const user = response.data;
      
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      setRole(user.role || "user");
      setStatus(user.status || "Active");
      setBalance(user.balance?.toString() || "0");
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (balance && isNaN(Number(balance))) {
      newErrors.balance = "Balance must be a number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFields()) return;

    try {
      setSubmitting(true);
      
      await api.patch(`/admin/users/${params.id}`, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        role,
        status,
        balance: Number(balance),
      });
      
      toast.success("User updated successfully");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/admin/users");
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<PiUserCircleLight />} label="Edit User" />
        <div className="h-full flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiUserCircleLight />} label="Edit User" />

      <div className="h-full bg-light-gray p-8 overflow-auto">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white border border-light-gray-3 text-dark text-sm rounded-lg hover:bg-light-gray-2 transition-colors flex items-center gap-2"
          >
            <IoArrowBack className="text-lg" />
            Back to Users
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border-2 border-light-gray-3 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-dark mb-6">User Information</h2>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  value={firstName}
                  type="text"
                  error=""
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  type="text"
                  error=""
                  onChange={(e) => setLastName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  value={email}
                  type="email"
                  error={errors.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  type="tel"
                  error=""
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Country"
                  value={country}
                  error=""
                  type="text"
                  onChange={(e) => setCountry(e.target.value)}
                />
                <Input
                  label="Balance"
                  value={balance}
                  type="text"
                  error={errors.balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-8 pb-8 border-b border-light-gray-3">
              <h3 className="text-lg font-semibold text-dark mb-4">Account Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Selection
                    label="Role"
                    items={["user", "admin", "manager"]}
                    selectedItem={role}
                    onChange={(value) => setRole(value)}
                  />
                </div>
                <div>
                  <Selection
                    label="Status"
                    items={["Active", "Suspended"]}
                    selectedItem={status}
                    onChange={(value) => setStatus(value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update User"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-light-gray-2 text-dark border border-light-gray-3 rounded-lg hover:bg-light-gray-3 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

