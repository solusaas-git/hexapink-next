"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Clock, ArrowUpRight } from "lucide-react";
import api from "@/lib/api-client";
import Spinner from "@/components/common/ui/Spinner";
import { formatDate } from "@/lib/utils/formatDate";

interface RecentOrder {
  _id: string;
  files: any[];
  prix: number;
  volume: number;
  paid: string;
  createdAt: string;
}

const filterOptions = ["All", "Paid", "Unpaid"];

export default function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/orders/recent?status=${currentFilter}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="bg-white border-2 border-light-gray-3 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-dark-blue" />
          <h3 className="text-lg font-bold text-dark">Recent Orders</h3>
          <button
            onClick={() => window.location.href = '/user/orders'}
            className="flex items-center gap-1 text-xs text-dark-blue hover:underline font-semibold ml-2"
          >
            See All <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-light-gray-2 border border-light-gray-3 rounded-lg p-1">
          {filterOptions.map((item) => (
            <button
              key={item}
              onClick={() => setCurrentFilter(item)}
              className={`px-3 py-1 text-sm font-semibold transition-all ${
                item === currentFilter
                  ? "bg-white border border-light-gray-3 rounded-md shadow-sm"
                  : "text-light-dark hover:text-dark"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" color="#4040BF" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-light-dark">
          <Package size={48} className="mx-auto mb-2 opacity-30" />
          <p>No orders available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-light-gray-3">
                <th className="text-left py-3 px-2 text-sm font-bold text-dark">Files</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-dark">Volume</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-dark">Price</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-dark">Status</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-dark">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-light-gray-3 hover:bg-light-gray-2 transition-colors"
                >
                  <td className="py-3 px-2 text-sm text-dark">{order.files?.length || 0}</td>
                  <td className="py-3 px-2 text-sm text-dark">{order.volume?.toLocaleString() || 0}</td>
                  <td className="py-3 px-2 text-sm font-semibold text-dark">${order.prix?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.paid === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

