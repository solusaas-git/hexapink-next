"use client";

import { useState, useEffect, useCallback } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { PiBankLight } from "react-icons/pi";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import api from "@/lib/api-client";
import PaymentMethodListHeader from "@/components/admin/payment/PaymentMethodListHeader";
import { PaymentMethodListItem } from "@/components/admin/payment/PaymentMethodListItem";
import SmtpConfig from "@/components/admin/settings/SmtpConfig";
import CountrySettings from "@/components/admin/settings/CountrySettings";
import Selection from "@/components/common/forms/Selection";
import CreatePayment from "@/components/admin/payment/CreatePayment";
import EditPayment from "@/components/admin/payment/EditPayment";

interface Payment {
  _id: string;
  type: string;
  paymentType: string;
  bankName: string;
  accountOwner?: string;
  accountNumber?: string;
  bankLogo?: string;
  qrCode?: string;
  iban?: string;
  rib?: string;
  swift?: string;
  publicKey?: string;
  secretKey?: string;
  status: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "smtp" | "countries" | "payment-methods">("general");
  const [settings, setSettings] = useState({
    siteName: "HexaPink",
    supportEmail: "support@hexapink.com",
    maintenanceMode: false,
    allowRegistration: true,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [isNewPaymentPanelVisible, setIsNewPaymentPanelVisible] = useState(false);
  const [isEditPaymentPanelVisible, setIsEditPaymentPanelVisible] = useState(false);
  const [editPaymentData, setEditPaymentData] = useState<Payment | null>(null);
  
  // SMTP state
  const [selectedSmtpType, setSelectedSmtpType] = useState("Primary");
  const [smtpData, setSmtpData] = useState<any>(null);
  const [smtpLoading, setSmtpLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const response = await api.get("/admin/payments");
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const fetchSmtpData = useCallback(async () => {
    try {
      setSmtpLoading(true);
      const response = await api.get("/admin/smtp", { params: { type: selectedSmtpType } });
      setSmtpData(response.data);
    } catch (error) {
      console.error("Error fetching SMTP:", error);
      toast.error("Failed to load SMTP configuration");
    } finally {
      setSmtpLoading(false);
    }
  }, [selectedSmtpType]);

  useEffect(() => {
    if (activeTab === "payment-methods") {
      fetchPayments();
    }
    if (activeTab === "smtp") {
      fetchSmtpData();
    }
  }, [activeTab, fetchPayments, fetchSmtpData]);

  useEffect(() => {
    if (activeTab === "smtp") {
      fetchSmtpData();
    }
  }, [selectedSmtpType, activeTab, fetchSmtpData]);

  const handleSaveSmtp = async (config: any) => {
    try {
      const response = await api.post("/admin/smtp", {
        type: selectedSmtpType,
        ...config,
      });
      setSmtpData(response.data);
      toast.success(`${selectedSmtpType} SMTP configuration saved successfully`);
    } catch (error) {
      console.error("Error saving SMTP:", error);
      toast.error("Failed to save SMTP configuration");
      throw error;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.put("/admin/settings", settings);
      toast.success("Settings updated successfully");
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (index: string) => {
    setSelectedPayments((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await api.delete(`/admin/payments/${paymentId}`);
      toast.success("Payment method deleted");
      fetchPayments();
    } catch {
      toast.error("Failed to delete payment method");
    }
  };

  const handleEditPayment = (paymentId: string) => {
    const payment = payments.find((p) => p._id === paymentId);
    if (payment) {
      setEditPaymentData(payment);
      setIsNewPaymentPanelVisible(false);
      setIsEditPaymentPanelVisible(true);
    }
  };

  const handleAddPaymentClick = () => {
    setIsEditPaymentPanelVisible(false);
    setIsNewPaymentPanelVisible(!isNewPaymentPanelVisible);
  };

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<IoSettingsOutline />} label="Settings" />

      <div className="py-6 flex flex-col">
        {/* Tab Navigation - Old App Style */}
        <div className="flex border-b border-light-gray-1 px-8">
          <span
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === "general"
                ? "border-b-2 border-dark-blue text-dark-blue font-bold"
                : "text-light-dark"
            }`}
          >
            General
          </span>
          <span
            onClick={() => setActiveTab("smtp")}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === "smtp"
                ? "border-b-2 border-dark-blue text-dark-blue font-bold"
                : "text-light-dark"
            }`}
          >
            SMTP
          </span>
          <span
            onClick={() => setActiveTab("countries")}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === "countries"
                ? "border-b-2 border-dark-blue text-dark-blue font-bold"
                : "text-light-dark"
            }`}
          >
            Countries
          </span>
          <span
            onClick={() => setActiveTab("payment-methods")}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === "payment-methods"
                ? "border-b-2 border-dark-blue text-dark-blue font-bold"
                : "text-light-dark"
            }`}
          >
            Payment Methods
            {payments.length > 0 && activeTab !== "payment-methods" && (
              <span className="ml-2 bg-dark-blue text-white px-2 py-0.5 rounded-full text-xs">
                {payments.length}
              </span>
            )}
          </span>
        </div>

        {/* Tab Content */}
        <div className="h-full bg-light-gray flex flex-row">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="h-full flex flex-col flex-1 p-12">
              <div className="max-w-2xl bg-white rounded-lg border border-light-gray-3 p-8">
                <h2 className="text-xl font-bold mb-6">Platform Settings</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-light-gray-3 rounded-lg focus:outline-none focus:border-dark-blue"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Maintenance Mode
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) =>
                      setSettings({ ...settings, allowRegistration: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Allow New Registrations
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-dark-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </form>
              </div>
            </div>
          )}

          {/* SMTP Tab */}
          {activeTab === "smtp" && (
            <div className="h-full flex flex-col flex-1 p-12">
              <Selection
                label="SMTP Type"
                items={["Primary", "Failover"]}
                selectedItem={selectedSmtpType}
                disabled={smtpLoading}
                onChange={setSelectedSmtpType}
              />
              <div className="mt-6">
                {smtpLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="#4040BF" />
                  </div>
                ) : (
                  <SmtpConfig
                    smtpType={selectedSmtpType}
                    smtpData={smtpData}
                    onSave={handleSaveSmtp}
                  />
                )}
              </div>
            </div>
          )}

          {/* Countries Tab */}
          {activeTab === "countries" && (
            <div className="h-full flex flex-col flex-1 p-12">
              <CountrySettings />
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payment-methods" && (
            <div className="h-full flex flex-col flex-1 p-12">
              {/* Add Payment Button */}
              <div className="mb-6">
                <button
                  onClick={handleAddPaymentClick}
                  className="px-4 py-2 bg-dark-blue text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <PiBankLight className="text-lg" />
                  Add Payment Method
                </button>
              </div>

              {paymentsLoading ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <Spinner size="lg" color="#4040BF" />
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-light-dark">
                  <PiBankLight className="text-6xl mb-4 text-light-gray-3" />
                  <p className="text-lg">No payment methods found</p>
                  <p className="text-sm mt-2">Click "Add Payment Method" to create one</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <PaymentMethodListHeader />
                  {payments.map((payment, index) => (
                    <PaymentMethodListItem
                      key={payment._id}
                      data={payment}
                      index={String(index)}
                      isSelected={selectedPayments.includes(String(index))}
                      onCheckboxChange={handleCheckboxChange}
                      onDelete={handleDeletePayment}
                      onEdit={handleEditPayment}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isNewPaymentPanelVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent">
            <CreatePayment
              onClose={() => setIsNewPaymentPanelVisible(false)}
              onPaymentCreated={() => {
                fetchPayments();
                setIsNewPaymentPanelVisible(false);
              }}
            />
          </div>
        </div>
      )}

      {isEditPaymentPanelVisible && editPaymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent">
            <EditPayment
              paymentData={editPaymentData}
              onClose={() => setIsEditPaymentPanelVisible(false)}
              onPaymentUpdated={() => {
                fetchPayments();
                setIsEditPaymentPanelVisible(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
