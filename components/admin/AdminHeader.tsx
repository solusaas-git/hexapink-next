"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusCircle, Wallet, UserCircle } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface HeaderProps {
  icon: React.ReactNode;
  label: string;
}

export default function AdminHeader({ icon, label }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currency } = useCurrencyContext();
  const { currentUser } = useUserContext();

  const handleClickCreateTable = () => {
    router.push("/admin/tables?create=true");
  };

  return (
    <div className="h-20 min-h-20 max-h-20 box-border px-4 sm:px-8 border-b border-light-gray-3 flex justify-between items-center bg-white">
      <div className="flex items-center gap-2 text-xl">
        {React.cloneElement(icon as React.ReactElement, {
          style: { color: "#4040BF" },
        })}
        <h2 className="text-dark-blue font-bold">{label}</h2>
      </div>

      <div className="flex items-center gap-8">
        {pathname.includes("/dashboard") && (
          <div className="hidden xl:flex justify-center items-center gap-4">
            <button
              onClick={handleClickCreateTable}
              className="rounded-full px-4 py-2 flex items-center gap-2 bg-dark-blue text-white border-none font-semibold"
            >
              <PlusCircle size={22} /> <span>Create Table</span>
            </button>
            <Link
              href="/admin/collections/new"
              className="rounded-full px-4 py-2 flex items-center gap-2 bg-white text-dark-blue border border-dark-blue font-semibold"
            >
              <PlusCircle size={22} /> <span>Create Collection</span>
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2 cursor-pointer">
          <Wallet size={22} />
          <span className="font-semibold">Wallet</span>
        </div>

        <span className="bg-light-gray-1 p-1 rounded-lg text-sm font-semibold">
          {currency}
          {currentUser?.balance || 0}
        </span>
        <div className="flex items-center gap-2 cursor-pointer">
          <UserCircle size={22} />
          <span className="hidden sm:flex font-semibold">
            {(currentUser as any)?.firstName || currentUser?.email}
          </span>
        </div>
      </div>
    </div>
  );
}

