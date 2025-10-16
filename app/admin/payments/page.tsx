"use client";

import { useState, useEffect } from "react";
import { PiBankLight } from "react-icons/pi";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";

interface Payment {
  _id: string;
  type: string;
  bankName: string;
  accountOwner?: string;
  status: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get("/admin/payments");
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiBankLight />} label="Payment Methods" />

      <div className="h-full bg-light-gray p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full h-64 flex items-center justify-center">
              <Spinner size="lg" color="#4040BF" />
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white border-2 border-light-gray-3 rounded-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <PiBankLight className="text-2xl text-dark-blue" />
                  <h3 className="font-semibold capitalize">{payment.type}</h3>
                </div>
                <p className="text-lg font-bold mb-2">{payment.bankName}</p>
                {payment.accountOwner && (
                  <p className="text-sm text-gray-600 mb-2">{payment.accountOwner}</p>
                )}
                <span
                  className={`inline-block px-3 py-1 rounded text-xs ${
                    payment.status === "Active"
                      ? "bg-light-green-2 text-green"
                      : "bg-light-gray text-gray-600"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
