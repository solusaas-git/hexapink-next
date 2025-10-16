"use client";

import NextImage from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  PanelLeftOpen,
  PanelRightOpen,
  LogOut,
  LayoutDashboard,
  Database,
  Package,
  Search,
} from "lucide-react";

import { SidebarItemType } from "./SidebarItem";
import { useUserContext } from "@/contexts/UserContext";
import SidebarItem from "./SidebarItem";

const Logo = "/assets/TheHomePage/image/logo.webp";

const items: SidebarItemType[] = [
  {
    type: "user",
    label: "Dashboard",
    link: "dashboard",
    icon: <LayoutDashboard size={20} />,
    selectedIcon: <LayoutDashboard size={20} />,
  },
  {
    type: "user",
    label: "Files",
    link: "files",
    icon: <Database size={20} />,
    selectedIcon: <Database size={20} />,
  },
  {
    type: "user",
    label: "Orders",
    link: "orders",
    icon: <Package size={20} />,
    selectedIcon: <Package size={20} />,
  },
  {
    type: "user",
    label: "Look up",
    link: "lookup",
    icon: <Search size={20} />,
    selectedIcon: <Search size={20} />,
  },
];

const UserSidebar: React.FC = () => {
  const { currentUser, logout } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Mobile Toggle Button */}
      <div
        className={`sm:hidden p-2 text-dark text-2xl border border-light-gray-3 rounded-full bg-white cursor-pointer absolute top-14 ${
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
        <div className="h-full p-6 flex flex-col justify-between" style={{ paddingBottom: "6.5rem" }}>
          <div className="flex flex-col justify-between items-start">
            <div className="w-full flex flex-col gap-2">
              {items.map((item, index) => (
                <div key={index} className="relative">
                  <SidebarItem data={item} />
                </div>
              ))}
            </div>
          </div>

          {currentUser && (
            <button
              onClick={logout}
              className="bg-dark-blue text-white hover:bg-opacity-90 rounded-lg flex items-center gap-2 p-2 sm:p-3 transition-all font-semibold"
            >
              <LogOut size={20} />
              <span className="hidden lg:flex">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
