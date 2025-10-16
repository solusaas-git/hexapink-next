"use client";

import NextImage from "next/image";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCard from "@/components/admin/AdminCard";
import { LayoutDashboard, Users, Package, Table, FolderOpen, DollarSign, TrendingUp, TrendingDown, Eye, Clock, Crown, TrendingUpIcon } from "lucide-react";
import api from "@/lib/api-client";
import Spinner from "@/components/common/ui/Spinner";
import { formatDate } from "@/lib/utils/formatDate";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalTables: number;
  totalCollections: number;
  totalRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingOrders: number;
  userGrowth: number;
  revenueGrowth: number;
  weekRevenueGrowth: number;
  monthRevenueGrowth: number;
}

interface RecentOrder {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  prix: number;
  volume: number;
  paid: string;
  filesCount: number;
  createdAt: string;
}

interface TopBuyer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

interface TopCollection {
  _id: string;
  title: string;
  image: string;
  totalSales: number;
  orderCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [topCollections, setTopCollections] = useState<TopCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    fetchTopBuyers();
    fetchTopCollections();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/admin/orders/recent");
      setRecentOrders(response.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchTopBuyers = async () => {
    try {
      const response = await api.get("/admin/top-buyers");
      setTopBuyers(response.data);
    } catch (error) {
      console.error("Error fetching top buyers:", error);
    } finally {
      setBuyersLoading(false);
    }
  };

  const fetchTopCollections = async () => {
    try {
      const response = await api.get("/admin/top-collections");
      setTopCollections(response.data);
    } catch (error) {
      console.error("Error fetching top collections:", error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<LayoutDashboard />} label="Dashboard" />
      <div className="h-full flex flex-row gap-4 justify-between overflow-hidden">
        <div className="flex-1 px-8 py-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" color="#4040BF" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    {stats?.userGrowth !== undefined && (
                      <div className={`flex items-center gap-1 text-sm ${stats.userGrowth >= 0 ? 'text-green' : 'text-red'}`}>
                        {stats.userGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-semibold">{Math.abs(stats.userGrowth)}%</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-1">{stats?.totalUsers || 0}</h3>
                  <p className="text-sm text-light-dark">Total Users</p>
                </div>

                {/* Total Orders */}
                <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-600" size={24} />
                    </div>
                    {stats?.pendingOrders !== undefined && stats.pendingOrders > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full">
                        {stats.pendingOrders} pending
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-1">{stats?.totalOrders || 0}</h3>
                  <p className="text-sm text-light-dark">Total Orders</p>
                </div>

                {/* Total Tables */}
                <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Table className="text-green-600" size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-1">{stats?.totalTables || 0}</h3>
                  <p className="text-sm text-light-dark">Total Tables</p>
                </div>

                {/* Total Collections */}
                <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="text-orange-600" size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-1">{stats?.totalCollections || 0}</h3>
                  <p className="text-sm text-light-dark">Total Collections</p>
                </div>
              </div>

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* This Week Revenue */}
                <div className="rounded-lg p-5 text-white border-2" style={{ background: 'linear-gradient(to bottom right, #10b981, #059669)', borderColor: '#059669' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>This Week</p>
                      <h3 className="text-2xl font-bold">${stats?.weekRevenue?.toFixed(2) || '0.00'}</h3>
                    </div>
                  </div>
                  {stats?.weekRevenueGrowth !== undefined && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      {stats.weekRevenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-semibold">{Math.abs(stats.weekRevenueGrowth)}% growth</span>
                    </div>
                  )}
                </div>

                {/* This Month Revenue */}
                <div className="rounded-lg p-5 text-white border-2" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', borderColor: '#2563eb' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>This Month</p>
                      <h3 className="text-2xl font-bold">${stats?.monthRevenue?.toFixed(2) || '0.00'}</h3>
                    </div>
                  </div>
                  {stats?.monthRevenueGrowth !== undefined && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      {stats.monthRevenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-semibold">{Math.abs(stats.monthRevenueGrowth)}% growth</span>
                    </div>
                  )}
                </div>

                {/* Total Revenue */}
                <div className="rounded-lg p-5 text-white border-2 border-dark-blue" style={{ background: 'linear-gradient(to bottom right, #4040BF, #9333ea)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Revenue</p>
                      <h3 className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                    </div>
                  </div>
                  {stats?.revenueGrowth !== undefined && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      {stats.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-semibold">{Math.abs(stats.revenueGrowth)}% growth</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders Widget */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-dark">Recent Orders</h3>
                  <button
                    onClick={() => window.location.href = '/admin/orders'}
                    className="text-sm text-dark-blue hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <Package size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No recent orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-light-gray-3">
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Customer</th>
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Files</th>
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Volume</th>
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Price</th>
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Status</th>
                          <th className="text-left py-3 px-2 text-sm font-bold text-dark">Date</th>
                          <th className="text-center py-3 px-2 text-sm font-bold text-dark">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-b border-light-gray-3 hover:bg-light-gray-2 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-dark">
                                  {order.user.firstName} {order.user.lastName}
                                </span>
                                <span className="text-xs text-light-dark">{order.user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-dark">{order.filesCount}</td>
                            <td className="py-3 px-2 text-sm text-dark">{order.volume.toLocaleString()}</td>
                            <td className="py-3 px-2 text-sm font-semibold text-dark">${order.prix.toFixed(2)}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  order.paid === "Paid"
                                    ? "bg-green-100 text-green-600"
                                    : order.paid === "Waiting"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {order.paid}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1 text-xs text-light-dark">
                                <Clock size={12} />
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => window.location.href = `/admin/orders/view/${order._id}`}
                                className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-light-gray-3 transition-colors"
                                title="View Order"
                              >
                                <Eye size={18} className="text-dark-blue" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Buyers Widget */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown size={20} className="text-yellow-500" />
                    <h3 className="text-lg font-bold text-dark">Top Buyers</h3>
                  </div>
                  <button
                    onClick={() => window.location.href = '/admin/users'}
                    className="text-sm text-dark-blue hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                
                {buyersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : topBuyers.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <Users size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No buyers yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topBuyers.map((buyer, index) => (
                      <div
                        key={buyer._id}
                        className="flex items-center justify-between p-4 border-2 border-light-gray-3 rounded-lg hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => window.location.href = `/admin/users/view/${buyer._id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-blue to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {buyer.firstName.charAt(0)}{buyer.lastName.charAt(0)}
                            </div>
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                'bg-orange-400 text-orange-900'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-dark">{buyer.firstName} {buyer.lastName}</h4>
                            <p className="text-xs text-light-dark">{buyer.email}</p>
                            <p className="text-xs text-light-dark mt-1">
                              <span className="font-semibold">{buyer.orderCount}</span> orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-dark">${buyer.totalSpent.toFixed(2)}</p>
                          <p className="text-xs text-light-dark">Total Spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Collections Widget */}
              <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon size={20} className="text-green-500" />
                    <h3 className="text-lg font-bold text-dark">Top Sold Collections</h3>
                  </div>
                  <button
                    onClick={() => window.location.href = '/admin/collections'}
                    className="text-sm text-dark-blue hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                
                {collectionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="#4040BF" />
                  </div>
                ) : topCollections.length === 0 ? (
                  <div className="text-center py-8 text-light-dark">
                    <FolderOpen size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No collections sold yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topCollections.map((collection, index) => (
                      <div
                        key={collection._id}
                        className="flex items-center justify-between p-4 border-2 border-light-gray-3 rounded-lg hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => window.location.href = `/admin/collections/view/${collection._id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {collection.image ? (
                              <NextImage
                                src={collection.image.startsWith('/') ? collection.image : `/${collection.image}`}
                                alt={collection.title}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-light-gray-3"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <FolderOpen className="text-white" size={24} />
                              </div>
                            )}
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                'bg-orange-400 text-orange-900'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-dark">{collection.title}</h4>
                            <p className="text-xs text-light-dark mt-1">
                              <span className="font-semibold">{collection.orderCount}</span> orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-dark">${collection.totalSales.toFixed(2)}</p>
                          <p className="text-xs text-light-dark">Total Sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-80 px-4 py-4 border-l-2 border-light-gray-1 flex justify-center">
          <AdminCard />
        </div>
      </div>
    </div>
  );
}
