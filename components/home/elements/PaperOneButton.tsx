"use client";

import { useRouter } from "next/navigation";
import SignupButtonDesktop from "@/components/home/elements/desktop/SignupButtonDesktop";
import LoginButtonDesktop from "@/components/home/elements/desktop/LoginButtonDesktop";
import SignupButtonMobile from "@/components/home/elements/mobile/SignupButtonMobile";
import LoginButtonMobile from "@/components/home/elements/mobile/LoginButtonMobile";

export default function PaperOneButton() {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push("/login");
  };
  
  const handleSignup = () => {
    router.push("/signup/1");
  };
  
  return (
    <>
      {/* Desktop Buttons */}
      <div className="hidden lg:flex lg:flex-col lg:gap-4">
        <SignupButtonDesktop onClick={handleSignup} active={true}>
          <span>Create Account</span>
        </SignupButtonDesktop>
        <LoginButtonDesktop onClick={handleLogin} active={true}>
          <span>Log in</span>
        </LoginButtonDesktop>
      </div>
      
      {/* Mobile Buttons */}
      <div className="flex flex-wrap gap-8 justify-start items-start lg:hidden">
        <SignupButtonMobile onClick={handleSignup}>
          <span>Register</span>
        </SignupButtonMobile>
        <LoginButtonMobile onClick={handleLogin}>
          <span>Log In</span>
        </LoginButtonMobile>
      </div>
    </>
  );
}
