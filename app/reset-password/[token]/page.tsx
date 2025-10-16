"use client";

import { use } from "react";
import Image from "next/image";
import FloatingNavbar from "@/components/home/FloatingNavbar";
import ResetPasswordForm from "@/components/auth/ResetPassword/ResetPasswordForm";

const BackgroundImage1 = "/assets/TheHomePage/image/bg1.webp";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div className="w-full min-h-screen h-full relative flex flex-col">
      <div className="h-full fixed left-0 top-0 z-0">
        <Image
          src={BackgroundImage1}
          alt="polygon background"
          width={800}
          height={600}
          className="w-2/3 sm:w-auto sm:h-full"
          priority
        />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col">
        <FloatingNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
