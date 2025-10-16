"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/lib/api-client";
import { Database, Package, Search, DollarSign, TrendingUp, Clock, Eye, Download, Wallet, ArrowUpRight, Columns, Rows } from "lucide-react";
import UserHeader from "@/components/user/UserHeader";
import { LayoutDashboard } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import { formatDate } from "@/lib/utils/formatDate";

interface Stats {
  totalFiles: number;
  totalOrders: number;
  totalLookups: number;
  totalSpent: number;
  weekSpent: number;
  monthSpent: number;
  balance: number;
}

interface RecentOrder {
  _id: string;
  files: any[];
  prix: number;
  volume: number;
  paid: string;
  createdAt: string;
}

interface RecentFile {
  _id: string;
  title: string;
  image?: string;
  type: string;
  countries: string[];
  volume: number;
  columns: any;
  status: string;
  createdAt: string;
  path?: string;
  collectionId?: {
    _id: string;
    title: string;
    mobileImage?: string;
    image?: string;
    type?: string;
    countries?: string[];
  };
}

interface RecentTopup {
  _id: string;
  paymentmethod: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function UserDashboard() {
  const { currentUser } = useUserContext();
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalOrders: 0,
    totalLookups: 0,
    totalSpent: 0,
    weekSpent: 0,
    monthSpent: 0,
    balance: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [recentTopups, setRecentTopups] = useState<RecentTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [topupsLoading, setTopupsLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("All");
  const [fileFilter, setFileFilter] = useState("All");
  const [topupFilter, setTopupFilter] = useState("All");

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get("/user/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const response = await api.get(`/user/orders/recent?status=${orderFilter}`);
      setRecentOrders(response.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderFilter]);

  const fetchRecentFiles = useCallback(async () => {
    try {
      const response = await api.get(`/file/recent?status=${fileFilter}`);
      setRecentFiles(response.data);
    } catch (error) {
      console.error("Error fetching recent files:", error);
    } finally {
      setFilesLoading(false);
    }
  }, [fileFilter]);

  const fetchRecentTopups = useCallback(async () => {
    try {
      const response = await api.get(`/transaction/topups?status=${topupFilter}`);
      setRecentTopups(response.data);
    } catch (error) {
      console.error("Error fetching recent topups:", error);
    } finally {
      setTopupsLoading(false);
    }
  }, [topupFilter]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
    fetchRecentFiles();
    fetchRecentTopups();
  }, [fetchDashboardStats, fetchRecentOrders, fetchRecentFiles, fetchRecentTopups]);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  useEffect(() => {
    fetchRecentTopups();
  }, [fetchRecentTopups]);

  return (
    <div className="h-full flex flex-col">
      <UserHeader icon={<LayoutDashboard />} label="Dashboard" />
      <div className="flex-1 px-8 py-6 overflow-auto bg-light-gray-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" color="#4040BF" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Files */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-light-pink rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="text-pink" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{stats.totalFiles}</h3>
                    <p className="text-xs text-light-dark">Total Files</p>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-light-pink-2 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="text-pink" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{stats.totalOrders}</h3>
                    <p className="text-xs text-light-dark">Total Orders</p>
                  </div>
                </div>
              </div>

              {/* Total Lookups */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{stats.totalLookups}</h3>
                    <p className="text-xs text-light-dark">Total Lookups</p>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">${currentUser?.balance?.toFixed(2) || "0.00"}</h3>
                    <p className="text-xs text-light-dark">Current Balance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* This Week Spent */}
              <div className="rounded-lg p-5 text-white border-2" style={{ background: 'linear-gradient(to bottom right, #666666, #333333)', borderColor: '#333333' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>This Week</p>
                    <h3 className="text-2xl font-bold">${stats.weekSpent?.toFixed(2) || '0.00'}</h3>
                  </div>
                </div>
              </div>

              {/* This Month Spent */}
              <div className="rounded-lg p-5 text-white border-2" style={{ background: 'linear-gradient(to bottom right, #4040BF, #3030A0)', borderColor: '#4040BF' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>This Month</p>
                    <h3 className="text-2xl font-bold">${stats.monthSpent?.toFixed(2) || '0.00'}</h3>
                  </div>
                </div>
              </div>

              {/* Total Spent */}
              <div className="rounded-lg p-5 text-white border-2" style={{ background: 'linear-gradient(to bottom right, #FF6699, #FF3377)', borderColor: '#FF6699' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Spent</p>
                    <h3 className="text-2xl font-bold">${stats.totalSpent?.toFixed(2) || '0.00'}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Files, Orders, and Topups */}
            <div className="space-y-6">
              {/* Recent Files */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-pink" />
                    <h3 className="text-lg font-bold text-pink">Recent Files</h3>
                    <button
                      onClick={() => window.location.href = '/user/files'}
                      className="flex items-center gap-1 text-xs text-pink hover:underline font-semibold ml-2"
                    >
                      See All <ArrowUpRight size={14} />
                    </button>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-light-gray-2 border border-light-gray-3 rounded-lg p-1">
                    {["All", "Ready", "Waiting"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setFileFilter(item)}
                        className={`px-3 py-1 text-sm font-semibold transition-all ${
                          item === fileFilter
                            ? "bg-white border border-light-gray-3 rounded-md shadow-sm"
                            : "text-light-dark hover:text-dark"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : recentFiles.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <Database size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No files available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center text-light-dark font-semibold text-sm">
                      <span className="w-[8%] p-2 flex">File ID</span>
                      <span className="w-[22%] p-2 flex border-l border-light-gray-3">File Name</span>
                      <span className="w-[18%] p-2 flex border-l border-light-gray-3">Collection</span>
                      <span className="w-[13%] p-2 flex border-l border-light-gray-3">Volume</span>
                      <span className="w-[10%] p-2 flex border-l border-light-gray-3">Date</span>
                      <span className="w-[9%] p-2 flex border-l border-light-gray-3">Status</span>
                      <span className="w-[20%] p-2 flex border-l border-light-gray-3">Actions</span>
                    </div>
                    
                    {recentFiles.map((file) => {
                      const handleDownload = async (format: "csv" | "xlsx") => {
                        try {
                          const response = await fetch(
                            `/api/file/download?fileId=${file._id}&format=${format}`
                          );

                          if (!response.ok) {
                            throw new Error("Download failed");
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${file.title}.${format}`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          console.error("Error downloading file:", error);
                        }
                      };

                      return (
                        <div
                          key={file._id}
                          className="w-full bg-[#F7F7FC] flex border border-light-gray-3 rounded-lg text-light-dark hover:border-dark-blue transition-colors"
                        >
                          <div className="w-[8%] p-3 flex items-center">
                            <Database size={16} className="mr-2 flex-shrink-0 text-pink" />
                            <span className="font-semibold truncate text-xs">_{file._id?.slice(-5)}</span>
                          </div>
                          <div className="w-[22%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span className="font-bold text-sm truncate" title={file.title}>{file.title}</span>
                          </div>
                          <div className="w-[18%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
                            {file.collectionId?.mobileImage ? (
                              <div className="w-8 h-8 bg-[#F0F0FA] border border-light-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                                <NextImage
                                  src={file.collectionId.mobileImage.startsWith('/') || file.collectionId.mobileImage.startsWith('http') ? file.collectionId.mobileImage : `/${file.collectionId.mobileImage}`}
                                  alt={file.collectionId.title || file.title}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            ) : file.collectionId?.image ? (
                              <div className="w-8 h-8 bg-[#F0F0FA] border border-light-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                                <NextImage
                                  src={file.collectionId.image.startsWith('/') || file.collectionId.image.startsWith('http') ? file.collectionId.image : `/${file.collectionId.image}`}
                                  alt={file.collectionId.title || file.title}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            ) : file.image ? (
                              <div className="w-8 h-8 bg-[#F0F0FA] border border-light-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                                <NextImage
                                  src={file.image.startsWith('/') || file.image.startsWith('http') ? file.image : `/${file.image}`}
                                  alt={file.title}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-[#F0F0FA] border border-light-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Database size={16} className="text-light-dark" />
                              </div>
                            )}
                            <span className="font-medium text-xs truncate" title={file.collectionId?.title}>
                              {file.collectionId?.title || 'N/A'}
                            </span>
                          </div>
                          <div className="w-[13%] p-3 flex items-center gap-1.5 border-l border-dashed border-light-gray-3">
                            <Columns size={14} />
                            <span className="text-xs">{typeof file.columns === 'number' ? file.columns : (file.columns ? Object.keys(file.columns).length : 0)}</span>
                            <span className="text-light-dark">×</span>
                            <Rows size={14} />
                            <span className="text-xs">{file.volume?.toLocaleString() || 0}</span>
                          </div>
                          <div className="w-[10%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <Clock size={14} className="mr-1 flex-shrink-0" />
                            <span className="text-xs">{formatDate(file.createdAt)}</span>
                          </div>
                          <div className="w-[9%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs border ${
                                file.status === "Ready"
                                  ? "bg-light-green-2 border-light-green-1 text-green"
                                  : "bg-[#FAFAFA] border-[#E6E6E6] text-dark"
                              }`}
                            >
                              {file.status}
                            </span>
                          </div>
                          <div className="w-[20%] p-3 flex items-center gap-2 border-l border-dashed border-light-gray-3">
                            <button
                              onClick={() => window.location.href = `/user/files/${file._id}`}
                              className="p-2 rounded-lg bg-purple text-white hover:opacity-90 transition-all"
                              title="View File"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDownload("csv")}
                              disabled={file.status !== "Ready"}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                                file.status === "Ready"
                                  ? "bg-green text-white hover:opacity-90"
                                  : "bg-light-gray-2 text-light-gray-3 cursor-not-allowed"
                              }`}
                              title="Download CSV"
                            >
                              <Download size={12} />
                              <span>CSV</span>
                            </button>
                            <button
                              onClick={() => handleDownload("xlsx")}
                              disabled={file.status !== "Ready"}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                                file.status === "Ready"
                                  ? "bg-dark-blue text-white hover:opacity-90"
                                  : "bg-light-gray-2 text-light-gray-3 cursor-not-allowed"
                              }`}
                              title="Download XLSX"
                            >
                              <Download size={12} />
                              <span>XLSX</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-pink" />
                    <h3 className="text-lg font-bold text-pink">Recent Orders</h3>
                    <button
                      onClick={() => window.location.href = '/user/orders'}
                      className="flex items-center gap-1 text-xs text-pink hover:underline font-semibold ml-2"
                    >
                      See All <ArrowUpRight size={14} />
                    </button>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-light-gray-2 border border-light-gray-3 rounded-lg p-1">
                    {["All", "Paid", "Unpaid"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setOrderFilter(item)}
                        className={`px-3 py-1 text-sm font-semibold transition-all ${
                          item === orderFilter
                            ? "bg-white border border-light-gray-3 rounded-md shadow-sm"
                            : "text-light-dark hover:text-dark"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <Package size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No orders available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center text-light-dark font-semibold text-sm">
                      <span className="w-[15%] p-2 flex">Order ID</span>
                      <span className="w-[15%] p-2 flex border-l border-light-gray-3">Files</span>
                      <span className="w-[20%] p-2 flex border-l border-light-gray-3">Volume</span>
                      <span className="w-[15%] p-2 flex border-l border-light-gray-3">Price</span>
                      <span className="w-[15%] p-2 flex border-l border-light-gray-3">Status</span>
                      <span className="w-[20%] p-2 flex border-l border-light-gray-3">Date</span>
                    </div>
                    
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="w-full bg-[#F7F7FC] flex border border-light-gray-3 rounded-lg text-light-dark hover:border-dark-blue transition-colors"
                      >
                        <div className="w-[15%] p-3 flex items-center">
                          <Package size={16} className="mr-2 flex-shrink-0 text-pink" />
                          <span className="font-semibold">ord_{order._id?.slice(-5)}</span>
                        </div>
                        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span>{order.files?.length || 0} files</span>
                        </div>
                        <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span>{order.volume?.toLocaleString() || 0} leads</span>
                        </div>
                        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span className="font-semibold">${order.prix?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs border ${
                              order.paid === "Paid"
                                ? "bg-light-green-2 border-light-green-1 text-green"
                                : "bg-[#FAFAFA] border-[#E6E6E6] text-dark"
                            }`}
                          >
                            {order.paid}
                          </span>
                        </div>
                        <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <Clock size={14} className="mr-1 flex-shrink-0" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Top Ups */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-pink" />
                    <h3 className="text-lg font-bold text-pink">Recent Top Ups</h3>
                    <button
                      onClick={() => window.location.href = '/user/wallet'}
                      className="flex items-center gap-1 text-xs text-pink hover:underline font-semibold ml-2"
                    >
                      See All <ArrowUpRight size={14} />
                    </button>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-light-gray-2 border border-light-gray-3 rounded-lg p-1">
                    {["All", "Waiting", "Completed"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setTopupFilter(item)}
                        className={`px-3 py-1 text-sm font-semibold transition-all ${
                          item === topupFilter
                            ? "bg-white border border-light-gray-3 rounded-md shadow-sm"
                            : "text-light-dark hover:text-dark"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {topupsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : recentTopups.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <Wallet size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No top-ups available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center text-light-dark font-semibold text-sm">
                      <span className="w-[20%] p-2 flex">Top-up ID</span>
                      <span className="w-[30%] p-2 flex border-l border-light-gray-3">Payment Method</span>
                      <span className="w-[20%] p-2 flex border-l border-light-gray-3">Price</span>
                      <span className="w-[15%] p-2 flex border-l border-light-gray-3">Status</span>
                      <span className="w-[15%] p-2 flex border-l border-light-gray-3">Date</span>
                    </div>
                    
                    {recentTopups.map((topup) => (
                      <div
                        key={topup._id}
                        className="w-full bg-[#F7F7FC] flex border border-light-gray-3 rounded-lg text-light-dark hover:border-dark-blue transition-colors"
                      >
                        <div className="w-[20%] p-3 flex items-center">
                          <Wallet size={16} className="mr-2 flex-shrink-0 text-pink" />
                          <span className="font-semibold">top_{topup._id?.slice(-5)}</span>
                        </div>
                        <div className="w-[30%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span>{topup.paymentmethod}</span>
                        </div>
                        <div className="w-[20%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span className="font-semibold">${topup.price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs border ${
                              topup.status === "Completed"
                                ? "bg-light-green-2 border-light-green-1 text-green"
                                : "bg-[#FAFAFA] border-[#E6E6E6] text-dark"
                            }`}
                          >
                            {topup.status}
                          </span>
                        </div>
                        <div className="w-[15%] p-3 flex items-center border-l border-dashed border-light-gray-3">
                          <Clock size={14} className="mr-1 flex-shrink-0" />
                          {formatDate(topup.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

