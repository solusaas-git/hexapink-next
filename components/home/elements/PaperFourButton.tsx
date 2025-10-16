"use client";

import { useRouter } from "next/navigation";
import CustomFileButton from "@/components/home/elements/CustomFileButton";

export default function PaperFourButton() {
  const router = useRouter();

  const handleCustomFileButton = () => {
    router.push("/user/files/new");
  };
  
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <CustomFileButton onClick={handleCustomFileButton} active={false}>
          <span>Target Prospects</span>
        </CustomFileButton>
      </div>
      
      {/* Mobile */}
      <div className="lg:hidden">
        <CustomFileButton onClick={handleCustomFileButton} mobile>
          <span>Target Prospects</span>
        </CustomFileButton>
      </div>
    </>
  );
}
