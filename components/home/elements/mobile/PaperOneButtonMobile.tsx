"use client";

import { useRouter } from "next/navigation";
import LoginButtonMobile from "@/components/home/elements/mobile/LoginButtonMobile";
import SignupButtonMobile from "@/components/home/elements/mobile/SignupButtonMobile";

export default function HexapinkPaperOneButton_M() {
  const router = useRouter();
  const handleLogin = () => {
    router.push("/login");
  };
  const handleSignup = () => {
    router.push("/signup/1");
  };
  return (
    <div className="flex flex-wrap gap-8 justify-start items-start">
      <SignupButtonMobile onClick={handleSignup}>
        <span>Register</span>
      </SignupButtonMobile>
      <LoginButtonMobile onClick={handleLogin}>
        <span>Log In</span>
      </LoginButtonMobile>
    </div>
  );
}
