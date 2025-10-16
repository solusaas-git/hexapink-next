"use client";

import { Suspense } from "react";
import Image from "next/image";
import FloatingNavbar from "@/components/home/FloatingNavbar";
import SignupPageMain from "@/components/auth/Signup/SignupPageMain";

const BackgroundImage1 = "/assets/TheHomePage/image/bg1.webp";

export default function SignupPage() {
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
        <Suspense fallback={<div>Loading...</div>}>
          <SignupPageMain />
        </Suspense>
      </div>
    </div>
  );
}

