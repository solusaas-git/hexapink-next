"use client";

import NextImage from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  Table,
  FolderOpen,
  ArrowUpCircle,
  Star,
  Inbox,
  Settings,
  LogOut,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";

import { SidebarItemType } from "./SidebarItem";
import { useUserContext } from "@/contexts/UserContext";
import SidebarItem from "./SidebarItem";

const Logo = "/assets/TheHomePage/image/logo.webp";

const items: SidebarItemType[] = [
  {
    type: "admin",
    label: "Dashboard",
    link: "dashboard",
    icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
    selectedIcon: <LayoutDashboard size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Orders",
    link: "orders",
    icon: <Package size={20} strokeWidth={1.5} />,
    selectedIcon: <Package size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Users",
    link: "users",
    icon: <Users size={20} strokeWidth={1.5} />,
    selectedIcon: <Users size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Tables",
    link: "tables",
    icon: <Table size={20} strokeWidth={1.5} />,
    selectedIcon: <Table size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Collections",
    link: "collections",
    icon: <FolderOpen size={20} strokeWidth={1.5} />,
    selectedIcon: <FolderOpen size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Topup Requests",
    link: "topup-requests",
    icon: <ArrowUpCircle size={20} strokeWidth={1.5} />,
    selectedIcon: <ArrowUpCircle size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Reviews",
    link: "reviews",
    icon: <Star size={20} strokeWidth={1.5} />,
    selectedIcon: <Star size={20} strokeWidth={2.5} fill="currentColor" />,
  },
  {
    type: "admin",
    label: "Inbox",
    link: "inbox",
    icon: <Inbox size={20} strokeWidth={1.5} />,
    selectedIcon: <Inbox size={20} strokeWidth={2.5} />,
  },
  {
    type: "admin",
    label: "Settings",
    link: "settings",
    icon: <Settings size={20} strokeWidth={1.5} />,
    selectedIcon: <Settings size={20} strokeWidth={2.5} />,
  },
];

const AdminSidebar: React.FC = () => {
  const { currentUser, logout } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = 0; // TODO: Implement message context

  return (
    <div>
      {/* Mobile Toggle Button */}
      <div
        className={`sm:hidden p-2 text-dark border border-light-gray-3 rounded-full bg-white cursor-pointer absolute top-14 ${
          isOpen ? "left-12" : "-left-4"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <PanelRightOpen size={24} />
        ) : (
          <PanelLeftOpen size={24} />
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`min-h-screen h-full flex flex-col lg:w-72 bg-white text-dark border-r border-light-gray-3 ${
          isOpen ? "flex" : "hidden"
        } sm:flex`}
      >
        <div className="h-20 min-h-20 border-b p-2 flex items-center justify-center lg:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 lg:p-4 text-2xl font-bold cursor-pointer"
          >
            <NextImage src={Logo} alt="logo image" width={48} height={48} className="w-12 py-2 lg:py-0" />
            <span className="hidden lg:flex text-dark">Hexapink</span>
          </Link>
        </div>
        <div className="h-full p-6 flex flex-col justify-between">
          <div className="flex flex-col justify-between items-start">
            <div className="w-full flex flex-col gap-2">
              {items.map((item, index) => (
                <div key={index} className="relative">
                  <SidebarItem data={item} unreadCount={unreadCount} />
                </div>
              ))}
            </div>
          </div>

          {currentUser && (
            <button
              onClick={logout}
              className="bg-dark-blue text-white hover:bg-opacity-80 hover:shadow-md rounded-lg flex items-center gap-2 p-2 transition-all"
            >
              <LogOut size={20} />
              <span className="hidden lg:flex font-semibold">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
