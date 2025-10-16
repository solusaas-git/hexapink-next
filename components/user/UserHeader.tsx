"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, UserCircle, Plus } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface HeaderProps {
  icon: React.ReactNode;
  label: string;
}

export default function UserHeader({ icon, label }: HeaderProps) {
  const { currency } = useCurrencyContext();
  const { currentUser } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  const isWallet = pathname?.includes("/wallet");
  const isNewOrder = pathname?.includes("/files/new");

  const handleWalletClick = () => {
    router.push("/user/wallet");
  };

  const handleCreateOrderClick = () => {
    router.push("/user/files/new");
  };

  return (
    <div className="h-20 min-h-20 max-h-20 box-border px-4 sm:px-8 border-b border-light-gray-3 flex justify-between items-center bg-white">
      <div className="flex items-center gap-2 text-xl">
        {React.cloneElement(icon as React.ReactElement, {
          style: { color: "#4040BF" },
        })}
        <h2 className="text-dark-blue font-bold">{label}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Create Order Button */}
        <button
          onClick={handleCreateOrderClick}
          className={`px-4 py-2 flex items-center gap-2 cursor-pointer transition-all rounded-lg font-semibold ${
            isNewOrder
              ? "bg-green text-white"
              : "bg-green text-white hover:bg-opacity-90"
          }`}
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Create Order</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWalletClick}
            className={`p-2 flex items-center gap-2 cursor-pointer transition-all rounded-lg ${
              isWallet
                ? "bg-light-gray-2 border-2 border-light-gray-3"
                : "hover:bg-light-gray-2 hover:border-2 border-2 border-transparent"
            }`}
          >
            <Wallet size={22} className={isWallet ? "text-dark-blue" : "text-dark"} />
            <span className={`font-semibold ${isWallet ? "text-dark-blue" : "text-dark"}`}>
              Wallet
            </span>
          </button>
          <span className="bg-light-gray-1 p-2 px-3 rounded-lg text-sm font-semibold text-dark">
            {currency}
            {(currentUser?.balance || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <UserCircle size={22} className="text-dark" />
          <span className="hidden sm:flex font-semibold text-dark">
            {currentUser?.firstName || currentUser?.email}
          </span>
        </div>
      </div>
    </div>
  );
}

