import { PiCheckBold } from "react-icons/pi";

export default function TableListHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border rounded-md flex items-center justify-center">
        <PiCheckBold className="text-light-gray-3" />
      </div>
      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
        <span className="w-[30%] p-2 flex">Table Name</span>
        <span className="w-[15%] p-2 flex">Columns</span>
        <span className="w-[15%] p-2 flex">Leads</span>
        <span className="w-[25%] p-2 flex">Tags</span>
        <span className="w-[15%] p-2 flex">Created</span>
      </div>
    </div>
  );
}

