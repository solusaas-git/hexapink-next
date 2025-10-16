import { PiCheckBold } from "react-icons/pi";

export default function ReviewListHeader() {
  return (
    <div className="w-full flex items-center gap-2">
      <div className="w-6 h-6 border rounded-md flex items-center justify-center">
        <PiCheckBold className="text-light-gray-3" />
      </div>
      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
        <span className="w-[25%] p-2 flex">Name</span>
        <span className="w-[20%] p-2 flex">Company</span>
        <span className="w-[10%] p-2 flex">Rating</span>
        <span className="w-[30%] p-2 flex">Review</span>
        <span className="w-[15%] p-2 flex">Status</span>
      </div>
    </div>
  );
}

