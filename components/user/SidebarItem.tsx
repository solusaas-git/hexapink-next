"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarItemType {
  type: string;
  label: string;
  link: string;
  icon: React.ReactNode;
  selectedIcon: React.ReactNode;
}

export default function SidebarItem({
  data,
}: {
  data: SidebarItemType;
}) {
  const pathname = usePathname();
  const isActive = pathname.includes(`/${data.type}/${data.link}`);

  return (
    <Link href={`/${data.type}/${data.link}`}>
      <div
        className={`flex items-center gap-2 p-2 hover:border-light-gray-3 rounded-lg ${
          isActive
            ? "border border-light-gray-3 bg-light-gray"
            : "border border-transparent"
        }`}
      >
        {isActive
          ? React.cloneElement(data.selectedIcon as React.ReactElement, {
              style: { color: "#4040BF" },
            })
          : React.cloneElement(data.icon as React.ReactElement, {
              style: { color: "black" },
            })}
        <span
          className={`text-md relative font-semibold ${
            isActive ? "text-dark-blue" : "text-dark"
          } hidden lg:block`}
        >
          {data.label}
        </span>
      </div>
    </Link>
  );
}

export type { SidebarItemType };

