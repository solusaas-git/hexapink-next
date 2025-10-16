import { Check } from "lucide-react";

export default function FileListHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border rounded-md flex items-center justify-center">
        <Check className="text-light-gray-3" size={16} />
      </div>
      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
        <span className="w-[8%] p-2 flex font-semibold">Image</span>
        <span className="w-[22%] p-2 flex font-semibold">Title</span>
        <span className="w-[15%] p-2 flex font-semibold">Collection</span>
        <span className="w-[12%] p-2 flex font-semibold">Volume</span>
        <span className="w-[10%] p-2 flex font-semibold">Columns</span>
        <span className="w-[10%] p-2 flex font-semibold">Status</span>
        <span className="w-[13%] p-2 flex font-semibold">Created</span>
        <span className="w-[10%] p-2 flex font-semibold">Actions</span>
      </div>
    </div>
  );
}

