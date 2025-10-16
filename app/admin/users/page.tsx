"use client";

import { useState, useEffect, useCallback } from "react";
import { PiUserCircleLight } from "react-icons/pi";
import { CiFilter } from "react-icons/ci";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Pagination from "@/components/common/ui/Pagination";
import Spinner from "@/components/common/ui/Spinner";
import UserListHeader from "@/components/admin/users/UserListHeader";
import { UserListItem } from "@/components/admin/users/UserListItem";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  balance: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setFilteredUsers(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (index: string) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(index)
        ? prevSelectedUsers.filter((userIndex) => userIndex !== index)
        : [...prevSelectedUsers, index]
    );
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<PiUserCircleLight />} label="Users" />

      <div className="h-full bg-light-gray border-b border-light-gray-1 flex">
        <div className="flex flex-col flex-1 border-r border-light-gray-1">
          <div className="px-8 py-4 border-b border-light-gray-1 flex items-center justify-between text-light-dark">
            {selectedUsers.length > 0 && (
              <span>{selectedUsers.length} Selected</span>
            )}
            <div className="ml-auto flex items-center divide-x">
              <div className="pr-4 flex items-center gap-2">
                {filteredUsers.length > 0 && (
                  <span>{filteredUsers.length} Results</span>
                )}
                <button className="flex items-center border border-light-gray-3 rounded-md px-2 py-1 text-dark cursor-pointer">
                  <CiFilter />
                  <span>Filter</span>
                </button>
              </div>
              <div className="pl-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  rowsPerPage={itemsPerPage}
                  pageSizeOptions={pageSizeOptions}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-4">
            <UserListHeader />
            {loading ? (
              <div className="w-full h-full flex items-center justify-center py-20">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : (
              currentUsers.map((user) => (
                <UserListItem
                  data={user}
                  key={user._id}
                  index={user._id}
                  isSelected={selectedUsers.includes(user._id)}
                  onCheckboxChange={handleCheckboxChange}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
