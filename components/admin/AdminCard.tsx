"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Database, Users, Search, ArrowUpRight } from "lucide-react";
import api from "@/lib/api-client";

interface AdminCardType {
  type: string;
  value: string;
  moreinfo: boolean;
  icon: React.ReactNode;
}

const AdminCard: React.FC = () => {
  const [stats, setStats] = useState({
    balance: 0,
    files: 0,
    leads: 0,
    lookups: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/sidebar-stats");
      setStats({
        balance: response.data.totalRevenue || 0,
        files: response.data.totalFiles || 0,
        leads: response.data.totalLeads || 0,
        lookups: response.data.totalLookups || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const items: AdminCardType[] = [
    {
      type: "Balance",
      value: `$ ${stats.balance.toLocaleString()}`,
      moreinfo: true,
      icon: <Wallet size={20} />,
    },
    {
      type: "Files",
      value: stats.files.toString(),
      moreinfo: true,
      icon: <Database size={20} />,
    },
    {
      type: "Leads",
      value: stats.leads.toLocaleString(),
      moreinfo: false,
      icon: <Users size={20} />,
    },
    {
      type: "Look Ups",
      value: stats.lookups.toString(),
      moreinfo: true,
      icon: <Search size={20} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col border-2 border-light-gray-3 items-center justify-center bg-white rounded-xl"
        >
          <div className="flex flex-row border-b-2 w-full m-1 justify-between">
            <div className="flex items-center justify-center p-2 rounded-full gap-2">
              {item.icon}
              <span className="text-sm font-semibold text-gray-500">
                {item.type}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center m-4">
              {item.moreinfo && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    More
                  </span>
                  <ArrowUpRight size={16} />
                </div>
              )}
            </div>
          </div>
          <span className="text-2xl text-blue-700 font-bold w-full text-left px-4 py-5">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdminCard;

