"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft, Mail, Phone, Download, UserCircle } from "lucide-react";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils/formatDate";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  balance: number;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  collectionName: string;
  price: number;
  volume: number;
  status: string;
  createdAt: string;
}

interface File {
  _id: string;
  fileName: string;
  fileSize: number;
  volume: number;
  columns: number;
  path: string;
  uploadedAt: string;
}

interface Payment {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export default function UserViewPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "files" | "payments">("info");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Counts for tabs
  const [orderCount, setOrderCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get(`/admin/users/${params.id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchCounts = useCallback(async () => {
    try {
      // Fetch counts in parallel
      const [ordersRes, filesRes, paymentsRes] = await Promise.all([
        api.get(`/admin/users/${params.id}/orders`),
        api.get(`/admin/users/${params.id}/files`),
        api.get(`/admin/users/${params.id}/payments`),
      ]);
      
      setOrderCount(ordersRes.data.length);
      setFileCount(filesRes.data.length);
      setPaymentCount(paymentsRes.data.length);

      // Also set the data so we don't need to fetch again when clicking tabs
      setOrders(ordersRes.data);
      setFiles(filesRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUser();
    fetchCounts();
  }, [fetchUser, fetchCounts]);

  const fetchOrders = useCallback(async () => {
    try {
      setTabLoading(true);
      const response = await api.get(`/admin/users/${params.id}/orders`);
      setOrders(response.data);
      setOrderCount(response.data.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setTabLoading(false);
    }
  }, [params.id]);

  const fetchFiles = useCallback(async () => {
    try {
      setTabLoading(true);
      const response = await api.get(`/admin/users/${params.id}/files`);
      setFiles(response.data);
      setFileCount(response.data.length);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setTabLoading(false);
    }
  }, [params.id]);

  const fetchPayments = useCallback(async () => {
    try {
      setTabLoading(true);
      const response = await api.get(`/admin/users/${params.id}/payments`);
      setPayments(response.data);
      setPaymentCount(response.data.length);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setTabLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      fetchOrders();
    } else if (activeTab === "files" && files.length === 0) {
      fetchFiles();
    } else if (activeTab === "payments" && payments.length === 0) {
      fetchPayments();
    }
  }, [activeTab, fetchOrders, fetchFiles, fetchPayments, orders.length, files.length, payments.length]);

  const handleEdit = () => {
    router.push(`/admin/users/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${params.id}`);
        toast.success("User deleted successfully");
        router.push("/admin/users");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleBack = () => {
    router.push("/admin/users");
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<UserCircle />} label="User Details" />
        <div className="h-full flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<UserCircle />} label="User Details" />
        <div className="h-full flex flex-col items-center justify-center text-light-dark">
          <UserCircle className="text-6xl mb-4 text-light-gray-3" />
          <p className="text-lg">User not found</p>
        </div>
      </div>
    );
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email.split('@')[0];

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<UserCircle />} label="User Details" />

      <div className="h-full bg-light-gray flex flex-col">
        {/* Action Buttons */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 bg-dark-blue text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to Users
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-dark-blue text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Pencil size={18} />
              Edit User
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-light-gray-3 bg-white px-8 mt-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "info"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-light-dark hover:text-dark"
            }`}
          >
            User Info
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "orders"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-light-dark hover:text-dark"
            }`}
          >
            Orders ({orderCount})
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "files"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-light-dark hover:text-dark"
            }`}
          >
            Files ({fileCount})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "payments"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-light-dark hover:text-dark"
            }`}
          >
            Payments ({paymentCount})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === "info" && (
            <div className="bg-white border-2 border-light-gray-3 rounded-lg p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-light-gray-3">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-dark-blue text-white flex items-center justify-center text-3xl font-semibold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark mb-2">{displayName}</h2>
              <p className="text-lg text-light-dark mb-3">{user.email}</p>
              
              {/* Status and Role */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  user.status === "Active"
                    ? "bg-light-green-2 text-green border border-light-green-1"
                    : "bg-red/10 text-red border border-red"
                }`}>
                  {user.status}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-light-blue text-dark-blue border border-dark-blue capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-6">
              {user.firstName && (
                <div>
                  <p className="text-xs text-light-dark mb-1">First Name</p>
                  <p className="font-medium text-dark">{user.firstName}</p>
                </div>
              )}
              
              {user.lastName && (
                <div>
                  <p className="text-xs text-light-dark mb-1">Last Name</p>
                  <p className="font-medium text-dark">{user.lastName}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-light-dark mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="text-dark-blue" size={18} />
                  <a 
                    href={`mailto:${user.email}`}
                    className="font-medium text-dark-blue hover:underline"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
              
              {user.phone && (
                <div>
                  <p className="text-xs text-light-dark mb-1">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="text-dark-blue" size={18} />
                    <a 
                      href={`tel:${user.phone}`}
                      className="font-medium text-dark-blue hover:underline"
                    >
                      {user.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {user.country && (
                <div>
                  <p className="text-xs text-light-dark mb-1">Country</p>
                  <p className="font-medium text-dark">{user.country}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-light-dark mb-1">Account Balance</p>
                <p className="font-medium text-dark text-xl">${user.balance?.toFixed(2) || "0.00"}</p>
              </div>
              
              <div>
                <p className="text-xs text-light-dark mb-1">Role</p>
                <p className="font-medium text-dark capitalize">{user.role}</p>
              </div>
              
              <div>
                <p className="text-xs text-light-dark mb-1">Status</p>
                <p className="font-medium text-dark">{user.status}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-light-gray-3">
            <div>
              <span className="text-sm text-light-dark">Account Created</span>
              <p className="text-dark font-medium">{formatDate(user.createdAt)}</p>
              <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <span className="text-sm text-light-dark">Last Updated</span>
              <p className="text-dark font-medium">{formatDate(user.updatedAt)}</p>
              <p className="text-xs text-gray-400">{new Date(user.updatedAt).toLocaleTimeString()}</p>
            </div>
          </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              {tabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" color="#4040BF" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-light-dark bg-white border-2 border-light-gray-3 rounded-lg">
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="p-4 bg-white border-2 border-light-gray-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-dark mb-1">{order.collectionName}</p>
                        <p className="text-xs text-light-dark font-mono">{order._id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Volume</p>
                          <p className="font-semibold text-dark">{order.volume.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Price</p>
                          <p className="font-semibold text-dark-blue">${order.price.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Date</p>
                          <p className="text-sm text-dark">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-light-green-2 text-green border border-light-green-1"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                            : "bg-red/10 text-red border border-red"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <div>
              {tabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" color="#4040BF" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-light-dark bg-white border-2 border-light-gray-3 rounded-lg">
                  <p>No files found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file._id}
                      className="p-4 bg-white border-2 border-light-gray-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-dark mb-1">{file.fileName}</p>
                        <p className="text-xs text-light-dark font-mono">{file._id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Volume</p>
                          <p className="font-semibold text-dark">{file.volume.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Columns</p>
                          <p className="font-semibold text-dark">{file.columns}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Size</p>
                          <p className="font-semibold text-dark">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Uploaded</p>
                          <p className="text-sm text-dark">{formatDate(file.uploadedAt)}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (file.path) {
                              window.open(file.path.startsWith('http') ? file.path : `/${file.path}`, '_blank');
                            } else {
                              toast.error("File path not available");
                            }
                          }}
                          className="px-3 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                        >
                          <Download size={18} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div>
              {tabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" color="#4040BF" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-light-dark bg-white border-2 border-light-gray-3 rounded-lg">
                  <p>No payments found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="p-4 bg-white border-2 border-light-gray-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-dark mb-1">{payment.type}</p>
                        <p className="text-xs text-light-dark font-mono">{payment._id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Amount</p>
                          <p className="font-semibold text-dark-blue">${payment.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-light-dark">Date</p>
                          <p className="text-sm text-dark">{formatDate(payment.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === "approved"
                            ? "bg-light-green-2 text-green border border-light-green-1"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                            : "bg-red/10 text-red border border-red"
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

