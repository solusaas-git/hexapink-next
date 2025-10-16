"use client";

import { useRouter } from "next/navigation";
import CustomFileButtonMobile from "@/components/home/elements/mobile/CustomFileButtonMobile";

export default function PaperFourButtonMobile() {
  const router = useRouter();

  const handleCustomFileButton = () => {
    router.push("/user/files/new");
  };
  return (
    <CustomFileButtonMobile onClick={handleCustomFileButton}>
      <span>Target Prospects</span>
    </CustomFileButtonMobile>
  );
}
