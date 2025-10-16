import { PiCheckBold } from "react-icons/pi";

export default function PaymentMethodListHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border rounded-md flex items-center justify-center">
        <PiCheckBold className="text-light-gray-3" />
      </div>
      <div className="w-full bg-[#F7F7FC] border-2 border-light-gray-3 rounded-lg flex items-center divide-x">
        <span className="w-[20%] p-2 flex">Type</span>
        <span className="w-[30%] p-2 flex">Bank Name</span>
        <span className="w-[25%] p-2 flex">Account Owner</span>
        <span className="w-[15%] p-2 flex">Status</span>
        <span className="w-[10%] p-2 flex">Created</span>
      </div>
    </div>
  );
}

