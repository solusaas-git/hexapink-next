import { PiCheckBold } from "react-icons/pi";

export default function UserListHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border rounded-md flex items-center justify-center">
        <PiCheckBold className="text-light-gray-3" />
      </div>
      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
        <span className="w-[25%] p-2 flex">User</span>
        <span className="w-[25%] p-2 flex">Email</span>
        <span className="w-[12%] p-2 flex">Role</span>
        <span className="w-[15%] p-2 flex">Balance</span>
        <span className="w-[10%] p-2 flex">Status</span>
        <span className="w-[13%] p-2 flex">Registered</span>
      </div>
    </div>
  );
}

