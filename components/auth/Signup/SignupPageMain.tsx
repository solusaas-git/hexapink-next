"use client";

import NextImage from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import countriesData from "world-countries";

// Assets
const StepOne = "/assets/TheSignupPage/image/step1.webp";
const StepTwo = "/assets/TheSignupPage/image/step2.webp";
const StepThree = "/assets/TheSignupPage/image/step3.webp";
const StepOne_M = "/assets/TheSignupPage/image/step1_m.webp";
const StepTwo_M = "/assets/TheSignupPage/image/step2_m.webp";
const StepThree_M = "/assets/TheSignupPage/image/step3_m.webp";

// Components
import InputField from "@/components/auth/Login/InputField";
import PasswordField from "@/components/auth/Login/PasswordField";
import ContinueButton from "./ContinueButton";
import CountryCombobox from "./CountryCombobox";
import CountryCodeCombobox from "./CountryCodeCombobox";
import CreateAccountButton from "./CreateAccountButton";
import CheckBox from "@/components/home/elements/desktop/CheckBox";
import BackButton from "./BackButton";
import VerifyAccountButton from "./VerifyAccountButton";
import VerificationCodeInput, {
  VerificationCodeInputRef,
} from "./VerificationCodeInput";

// Actions
import { requireResendCode, signup, verifyEmail } from "@/lib/actions/auth";

interface StepTitleProps {
  step: string;
  currentStep: string;
  title: string;
}

interface StepImageProps {
  step: string;
  currentStep: string;
  src: string;
}

interface StepDescriptionProps {
  step: string;
  currentStep: string;
  children: React.ReactNode;
}

const StepTitle = ({ step, currentStep, title }: StepTitleProps) => (
  <h1
    className="text-left text-[26px] lg:text-[40px] font-kanit font-bold"
    hidden={step !== currentStep}
  >
    {title}
  </h1>
);

const StepImage = ({ step, currentStep, src }: StepImageProps) => (
  <NextImage
    src={src}
    alt="step image"
    width={400}
    height={300}
    hidden={step !== currentStep}
    className="w-full object-cover"
  />
);

const StepDescription = ({
  step,
  currentStep,
  children,
}: StepDescriptionProps) => (
  <p
    className="lg:text-[20px] text-[14px] font-raleway font-medium text-light-dark sm:mb-7 text-left"
    hidden={step !== currentStep}
  >
    {children}
  </p>
);

export default function SignupPageMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setLoading] = useState(false);

  const step = searchParams.get("step") || "1";
  const [agree, setAgree] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    industry: "",
    company: "",
    email: "",
    password: "",
    passwordConfirm: "",
    otp: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    industry: "",
    company: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const verificationCodeInputRef = useRef<VerificationCodeInputRef>(null);

  useEffect(() => {
    const updatedErrors = { ...errors };

    for (const key in formData) {
      if (
        formData[key as keyof typeof formData] &&
        errors[key as keyof typeof errors]
      ) {
        updatedErrors[key as keyof typeof errors] = ""; // Clear the error for the field
      }
    }

    setErrors(updatedErrors);
  }, [formData, errors]);

  const handleCountrySelect = (country: string) => {
    setFormData({ ...formData, country });
  };

  const validateProfileStep = () => {
    const newErrors: any = {};
    let isValid = true;

    if (!formData.firstName) {
      newErrors.firstName = "First name is required.";
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required.";
      isValid = false;
    }

    if (!formData.country) {
      newErrors.country = "Country is required.";
      isValid = false;
    }

    const countryNames = countriesData.map((country) => country.name.common);
    if (!countryNames.includes(formData.country)) {
      newErrors.country = "Country is incorrect.";
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
      isValid = false;
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required.";
      isValid = false;
    }

    if (!formData.company) {
      newErrors.company = "Company is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateInformationStep = () => {
    const { email, password, passwordConfirm } = formData;
    const newErrors: any = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Password does not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateProfileStep()) {
      router.push("/signup?step=2");
    }
  };

  const handleVerifyEmail = () => {
    if (!formData.email) {
      toast.warning("Please provide an email address.");
    } else if (formData.otp === "") {
      toast.warning("Please provide an OTP code.");
    } else {
      setLoading(true);
      verifyEmail(
        formData.email,
        formData.otp,
        (response: { message: string }) => {
          toast.success(response.message);
          router.push("/login");
        }
      ).finally(() => {
        setLoading(false);
      });
    }
    setFormData({ ...formData, otp: "" });
    verificationCodeInputRef.current?.clear();
  };

  const handleClickResendCode = () => {
    if (formData.email === "") {
      toast.warning("Please provide an email address.");
      router.push("/signup?step=2");
    } else {
      setLoading(true);
      requireResendCode(formData.email, (response: { message: string }) => {
        toast.success(response.message);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  const handleBack = () => {
    if (step === "2") {
      router.push("/signup?step=1");
    } else if (step === "3") {
      router.push("/signup?step=2");
    }
  };

  const handleSignup = () => {
    try {
      if (!validateInformationStep()) {
        return;
      }
      setLoading(true);
      signup(
        formData,
        (response: { message: string }) => {
          toast.success(response.message);
          router.push("/signup?step=3");
        },
        (error: any) => {
          if (error.response.data.errorType === "USER_ALREADY_EXISTS") {
            requireResendCode(
              formData.email,
              (response: { message: string }) => {
                toast.success(response.message);
              }
            );
            toast.info("User already exists. Please verify your email");
            router.push("/signup?step=3");
          } else if (
            error.response.data.errorType === "USER_ALREADY_REGISTERED"
          ) {
            toast.error("User already registered. Please login");
            router.push("/login");
          } else {
            toast.error("Unable to create account. Please try again.");
          }
        }
      ).finally(() => {
        setLoading(false);
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center gap-8 sm:gap-12 xl:gap-16">
      <div className="w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 lg:mt-10 mt-5 justify-start items-start flex flex-col gap-2 sm:gap-6 text-dark">
        <div className="sm:hidden w-full mb-4">
          <StepImage step={step} currentStep="1" src={StepOne_M} />
          <StepImage step={step} currentStep="2" src={StepTwo_M} />
          <StepImage step={step} currentStep="3" src={StepThree_M} />
        </div>
        <StepTitle
          step={step}
          currentStep="1"
          title="Complete your user profile"
        />
        <StepTitle
          step={step}
          currentStep="2"
          title="Fill your Log In Information"
        />
        <StepTitle
          step={step}
          currentStep="3"
          title="Check your email and Fill the Verification Code"
        />
        <StepDescription step={step} currentStep="1">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-light-dark border-b-2 font-raleway font-semibold border-[#666666]"
          >
            Log In
          </Link>
        </StepDescription>
        <StepDescription step={step} currentStep="2">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-light-dark border-b-2 font-raleway font-semibold border-[#666666]"
          >
            Log In
          </Link>
        </StepDescription>
        <StepDescription step={step} currentStep="3">
          You didn&apos;t receive any code in your email? &nbsp;
          <span
            onClick={handleClickResendCode}
            className="text-light-dark border-b-2 font-raleway font-semibold border-[#666666] tracking-wider cursor-pointer"
          >
            Resend Code &nbsp;
          </span>
          or
          <span
            onClick={() => router.push("/signup?step=2")}
            className="text-light-dark border-b-2 font-raleway font-semibold border-[#666666] tracking-wider cursor-pointer"
          >
            &nbsp;Change Email
          </span>
        </StepDescription>
      </div>
      <div className="flex sm:flex-row flex-col w-[80%] justify-start items-center gap-20 h-[90%]">
        <div className="sm:flex justify-start items-start hidden h-full">
          <StepImage step={step} currentStep="1" src={StepOne} />
          <StepImage step={step} currentStep="2" src={StepTwo} />
          <StepImage step={step} currentStep="3" src={StepThree} />
        </div>
        {step === "1" && (
          <div className="w-full lg:w-[80%] h-[90%] flex justify-start items-start flex-col gap-5">
            <div className="w-full flex justify-start items-start gap-4 flex-col">
              <div className="w-full flex lg:flex-row flex-col justify-start items-start gap-4 lg:gap-20">
                <InputField
                  type="text"
                  title="FIRST NAME *"
                  placeholder="Jaune"
                  value={formData.firstName}
                  error={errors.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <InputField
                  type="text"
                  title="LAST NAME *"
                  placeholder="Though"
                  value={formData.lastName}
                  error={errors.company}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
              <div className="w-full flex lg:flex-row flex-col justify-start items-start lg:gap-20 gap-4">
                <CountryCombobox
                  country={formData.company}
                  error={errors.country}
                  onCountrySelect={handleCountrySelect}
                />
                <CountryCodeCombobox
                  countryName={formData.country}
                  setPhoneNumber={(phoneNumber) =>
                    setFormData({ ...formData, phone: phoneNumber })
                  }
                  error={errors.phone}
                />
              </div>
              <div className="w-full flex lg:flex-row flex-col justify-start items-start gap-4 lg:gap-20">
                <InputField
                  type="text"
                  title="INDUSTRY *"
                  placeholder="Select a industry"
                  value={formData.industry}
                  error={errors.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                />
                <InputField
                  type="text"
                  title="COMPANY *"
                  placeholder="Select a company"
                  value={formData.company}
                  error={errors.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="sm:flex w-full justify-start items-center hidden mt-8">
              <ContinueButton onClick={handleContinue}>
                <span>Continue</span>
              </ContinueButton>
            </div>
          </div>
        )}
        {step === "2" && (
          <div className="flex w-full lg:w-[80%] h-[90%] justify-start items-start flex-col gap-10">
            <div className="w-full lg:3/4 xl:w-2/3 flex justify-start items-start gap-8 flex-col">
              <InputField
                type="text"
                title="EMAIL *"
                placeholder="jaune.though@earth.planet"
                value={formData.email}
                error={errors.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <div className="w-full flex lg:flex-row flex-col justify-between items-start lg:gap-6 gap-10">
                <PasswordField
                  title="PASSWORD *"
                  placeholder="Password"
                  value={formData.password}
                  error={errors.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <PasswordField
                  title="CONFIRM PASSWORD *"
                  placeholder="Confirm Password"
                  value={formData.passwordConfirm}
                  error={errors.passwordConfirm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordConfirm: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <CheckBox
              checked={agree}
              handleChange={() => setAgree(!agree)}
              text="I agree to the terms of use"
            ></CheckBox>
            <div className="w-full sm:flex justify-start items-start gap-8 hidden">
              <BackButton onClick={handleBack}>
                <span>Back</span>
              </BackButton>
              <CreateAccountButton onClick={handleSignup}>
                <span>Create Account</span>
              </CreateAccountButton>
            </div>
          </div>
        )}
        {step === "3" && (
          <div className="flex lg:w-[80%] h-[90%] justify-start items-start flex-col gap-5">
            <div className="w-full flex justify-start items-start gap-5 flex-col">
              <h1 className="font-raleway font-semibold text-[12px] text-[#333333]">
                VERIFICATION CODE
              </h1>
              <VerificationCodeInput
                ref={verificationCodeInputRef}
                onChange={(code) => setFormData({ ...formData, otp: code })}
              />
            </div>
            <div className="w-full sm:flex justify-start items-start gap-10 hidden">
              <BackButton onClick={handleBack}>
                <span>Back</span>
              </BackButton>
              <VerifyAccountButton onClick={handleVerifyEmail}>
                <span>Verify Account</span>
              </VerifyAccountButton>
            </div>
          </div>
        )}
      </div>

      {step === "1" && (
        <div className="w-full flex justify-center items-center py-4 bg-light-pink sm:hidden gap-5">
          <BackButton onClick={handleBack}>
            <span>Back</span>
          </BackButton>
          <ContinueButton onClick={handleContinue}>
            <span>Continue</span>
          </ContinueButton>
        </div>
      )}

      {step === "2" && (
        <div className="w-full flex justify-center items-center py-4 bg-light-pink sm:hidden gap-5">
          <BackButton onClick={handleBack}>
            <span>Back</span>
          </BackButton>
          <CreateAccountButton onClick={handleSignup}>
            <span>Create Account</span>
          </CreateAccountButton>
        </div>
      )}

      {step === "3" && (
        <div className="w-full flex justify-center items-start py-4 bg-light-pink gap-10 sm:hidden">
          <BackButton onClick={handleBack}>
            <span>Back</span>
          </BackButton>
          <VerifyAccountButton onClick={handleVerifyEmail}>
            <span>Verify Account</span>
          </VerifyAccountButton>
        </div>
      )}
    </div>
  );
}
