"use client";

import { useState, useEffect, useCallback } from "react";
import { PiArrowFatUpLight } from "react-icons/pi";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import TopupListHeader from "@/components/admin/topup/TopupListHeader";
import { TopupListItem } from "@/components/admin/topup/TopupListItem";

interface TopupRequest {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  paymentMethod: string;
  receipts: string[];
  status: string;
  createdAt: string;
}

export default function AdminTopupRequestsPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get("/admin/topup-requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching topup requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCheckboxChange = (index: string) => {
    setSelectedRequests((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.patch(`/admin/topup-requests/${requestId}`, { status: "approved" });
      toast.success("Request approved successfully");
      fetchRequests();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.patch(`/admin/topup-requests/${requestId}`, { status: "rejected" });
      toast.success("Request rejected");
      fetchRequests();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiArrowFatUpLight />} label="Topup Requests" />

      <div className="h-full bg-light-gray p-8">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Spinner size="lg" color="#4040BF" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-light-dark">
            <PiArrowFatUpLight className="text-6xl mb-4 text-light-gray-3" />
            <p className="text-lg">No top-up requests found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <TopupListHeader />
            {requests.map((request, index) => (
              <TopupListItem
                key={request._id}
                data={request}
                index={String(index)}
                isSelected={selectedRequests.includes(String(index))}
                onCheckboxChange={handleCheckboxChange}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
