"use client";

import NextImage from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Turnstile from "react-turnstile";

import CheckBox from "@/components/home/elements/desktop/CheckBox";
import InputField from "@/components/home/elements/desktop/InputField";
import SendMessageButton from "@/components/home/elements/desktop/SendMessageButton";
import CustomFileButtonBordered from "@/components/home/elements/CustomFileButtonBordered";
import SendMessageButtonMobile from "@/components/home/elements/desktop/SendMessageButtonMobile";
import ContactUsCTAMobile from "@/components/home/elements/desktop/ContactUsCTAMobile";
import CountryCodeCombobox from "@/components/auth/Signup/CountryCodeCombobox";

import api from "@/lib/api-client";


const MobilePattern = "/assets/TheHomePage/image/contactus_bg_mobile.webp";
const Pattern = "/assets/TheHomePage/image/contactus_bg.webp";
const BottomLogo = "/assets/TheHomePage/image/footer-logo.webp";
const Phone = "/assets/TheHomePage/image/phone.webp";
const Email = "/assets/TheHomePage/image/email.webp";
const Location = "/assets/TheHomePage/image/location.webp";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  message: "",
  agreeToEmails: true,
};

export default function ContactUs() {
  const navigate = useRouter();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  const setValue = (k: string, v: any) => {
    setFormData((oldData) => ({
      ...oldData,
      [k]: v,
    }));
  };

  const handleCreateCustomFile = () => {
    navigate.push("/user/files/new");
  };

  const handleSendMessage = async () => {
    if (loading) return; // Prevent double submission
    setLoading(true);
    try {
      await api.post("/message/create", formData);
      toast.success("Message sent successfully!");
      setFormData(initialFormData);
    } catch (error: any) {
      if (error.response.data.type === "FAILD_CAPTCHA_VERIFICATION") {
        toast.error("Faild captcha verification. Please try again.");
      } else {
        toast.error("Failed to send the message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col gap-4 justify-center items-center bg-[#FF6699]">
      <div className="w-full absolute -top-[1px] left-0 z-0 overflow-y-hidden flex md:hidden">
        <NextImage
          src={MobilePattern}
          alt="pattern image"
          width={400}
          height={200}
          className="w-full object-top"
        />
      </div>
      <div className="w-full h-full absolute top-0 left-0 z-0 overflow-y-hidden hidden md:flex">
        <NextImage src={Pattern} alt="pattern image" width={800} height={400} className="w-full object-top" />
      </div>

      <div className="w-full px-8 md:w-3/4 flex flex-col gap-8 z-20">
        <h1 className="text-center font-kanit font-bold text-3xl lg:text-4xl xl:text-5xl text-dark select-none">
          Do you have a specific leads in mind? Create your Custom File Now!
        </h1>
        <div className="w-full justify-center items-center z-10 hidden sm:flex">
          <CustomFileButtonBordered onClick={handleCreateCustomFile}>
            <span>Tailor My List</span>
          </CustomFileButtonBordered>
        </div>
        <div className="w-full justify-center items-center z-10 sm:hidden">
          <ContactUsCTAMobile onClick={handleCreateCustomFile}>
            Tailor My List
          </ContactUsCTAMobile>
        </div>
      </div>
      <div className="lg:w-1/2 px-4 lg:px-0 mx-auto z-10 mt-4 sm:mt-16">
        <div className="flex flex-col gap-4 items-cemter relative">
          <div className="w-full bg-white p-8 md:p-12 xl:p-16 flex flex-col gap-8 sm:gap-12 md:gap-16 xl:gap-20">
            <h1 className="text-left text-dark text-xl lg:text-3xl xl:text-4xl font-kanit font-semibold">
              Are you interested? Let&apos;s talk Business
            </h1>
            <p className="text-left text-light-dark font-raleway font-medium text-sm lg:text-md xl:text-lg">
              Fill this form or send an email to Contact@hexapink.com
            </p>

            <form className="flex flex-col gap-16">
              <div className="w-full flex justify-between lg:flex-row flex-col gap-10">
                <InputField
                  type="text"
                  title="FIRST NAME *"
                  placeholder="James"
                  value={formData.firstName}
                  setValue={(val) => setValue("firstName", val)}
                />
                <InputField
                  type="text"
                  title="LAST NAME *"
                  placeholder="Morgan"
                  value={formData.lastName}
                  setValue={(val) => setValue("lastName", val)}
                />
              </div>
              <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-10">
                <InputField
                  type="email"
                  title="EMAIL *"
                  value={formData.email}
                  setValue={(val) => setValue("email", val)}
                  placeholder="jaune.though@earth.planet"
                />
                <CountryCodeCombobox
                  countryName="Morocco"
                  setPhoneNumber={(phoneNumber) =>
                    setValue("phone", phoneNumber)
                  }
                  error=""
                />
              </div>
              <div className="w-full flex justify-between lg:flex-row flex-col gap-10">
                <InputField
                  type="text"
                  title="COMPANY"
                  value={formData.company}
                  setValue={(val) => setValue("company", val)}
                  placeholder="Your company name"
                />
                <InputField
                  type="text"
                  title="MESSAGE *"
                  value={formData.message}
                  setValue={(val) => setValue("message", val)}
                  placeholder="Your message"
                />
              </div>

              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onVerify={(token) => setValue("token", token)}
                size="flexible"
                theme="light"
              />

              <CheckBox
                handleChange={() =>
                  setValue("agreeToEmails", !formData.agreeToEmails)
                }
                checked={formData.agreeToEmails}
                text="I agree to receive emails from Hexapink *"
              />
              <div className="w-full justify-start items-center z-10 hidden lg:flex">
                <SendMessageButton
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </SendMessageButton>
              </div>
              <div className="w-full justify-start items-center z-10 flex lg:hidden">
                <SendMessageButtonMobile
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </SendMessageButtonMobile>
              </div>
            </form>
          </div>

          <div className="lg:w-14 flex flex-row lg:flex-col gap-8 lg:gap-4 justify-center items-center lg:absolute top-0 -left-20">
            <NextImage src={Phone} alt="phone icon" width={56} height={56} className="w-10 sm:w-14" />
            <NextImage src={Email} alt="email icon" width={56} height={56} className="w-10 sm:w-14" />
            <NextImage src={Location} alt="location icon" width={56} height={56} className="w-10 sm:w-14" />
          </div>
        </div>
      </div>
      <div className="w-full py-4 lg:py-12 flex flex-col items-center gap-4 border-t-2 border-white lg:border-none relative">
        <div className="flex gap-2 lg:absolute right-12">
          <NextImage src={BottomLogo} alt="logo icon" width={64} height={64} className="w-12 lg:w-16" />
          <span className="text-3xl font-kanit text-white font-semibold">
            Hexapink
          </span>
        </div>
        <span className="w-2/3 lg:w-1/3 text-white text-wrap font-raleway font-medium lg:text-xl text-lg text-center">
          Copyrights Hexapink 2024 - All Rights Reserved
        </span>
      </div>
    </div>
  );
}
