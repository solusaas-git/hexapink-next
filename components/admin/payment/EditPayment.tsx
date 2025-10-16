"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { IoCloseCircleOutline } from "react-icons/io5";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";

import Input from "@/components/common/Inputs/Input";
import FileUpload from "@/components/common/Inputs/FileUpload";
import { PiPlusCircle } from "react-icons/pi";
import HorizontalStep from "./HorizontalStep";
import api from "@/lib/api-client";
import Spinner from "@/components/common/ui/Spinner";

interface PaymentData {
  _id: string;
  type: string;
  paymentType: string;
  bankName?: string;
  accountOwner?: string;
  bankLogo?: string;
  qrCode?: string;
  accountNumber?: string;
  iban?: string;
  rib?: string;
  swift?: string;
  publicKey?: string;
  secretKey?: string;
  status: string;
  createdAt: string;
}

interface EditPaymentProps {
  paymentData: PaymentData;
  onClose: () => void;
  onPaymentUpdated: () => void;
}

const bankSteps = [
  { label: "General", number: 1 },
  { label: "Details", number: 2 },
  { label: "Done", number: 3 },
];

const stripeSteps = [
  { label: "General", number: 1 },
  { label: "Done", number: 2 },
];

const EditPayment: React.FC<EditPaymentProps> = ({
  paymentData,
  onClose,
  onPaymentUpdated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>("");
  const [accountOwner, setAccountOwner] = useState<string>("");
  const [bankLogo, setBankLogo] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<File | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [iban, setIban] = useState<string>("");
  const [rib, setRib] = useState<string>("");
  const [swift, setSwift] = useState<string>("");
  const [stripePublicKey, setStripePublicKey] = useState<string>("");
  const [stripeSecretKey, setStripeSecretKey] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (paymentData) {
      setBankName(paymentData.bankName || "");
      setAccountOwner(paymentData.accountOwner || "");
      setAccountNumber(paymentData.accountNumber || "");
      setIban(paymentData.iban || "");
      setRib(paymentData.rib || "");
      setSwift(paymentData.swift || "");
      setStripePublicKey(paymentData.publicKey || "");
      setStripeSecretKey(paymentData.secretKey || "");
    }
  }, [paymentData]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0] || null;
    if (type === "Bank Logo") {
      setBankLogo(file);
    } else if (type === "QR Code") {
      setQrCode(file);
    }
  };

  const handleCloseFile = (type: string) => {
    if (type === "Bank Logo") {
      setBankLogo(null);
    } else if (type === "QR Code") {
      setQrCode(null);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (paymentData.paymentType === "bank") {
      if (!bankName) newErrors.bankName = "Bank Name is required";
      if (!accountOwner) newErrors.accountOwner = "Account Owner is required";
      if (step === 2) {
        if (!accountNumber)
          newErrors.accountNumber = "Account Number is required";
        if (!rib) newErrors.rib = "RIB is required";
        if (!iban) newErrors.iban = "IBAN is required";
        if (!swift) newErrors.swift = "SWIFT is required";
      }
    } else {
      if (!stripePublicKey)
        newErrors.stripePublicKey = "Public Key is required";
      if (!stripeSecretKey)
        newErrors.stripeSecretKey = "Secret Key is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditPayment = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      if (paymentData.paymentType === "bank") {
        const formData = new FormData();
        formData.append("paymentMethod", "bank");
        formData.append("bankName", bankName);
        formData.append("accountOwner", accountOwner);
        formData.append("accountNumber", accountNumber);
        formData.append("rib", rib);
        formData.append("iban", iban);
        formData.append("swift", swift);
        if (bankLogo) {
          formData.append("bankLogo", bankLogo);
        }
        if (qrCode) {
          formData.append("qrCode", qrCode);
        }

        await api.put(`/admin/payments/${paymentData._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.put(`/admin/payments/${paymentData._id}`, {
          stripePublicKey,
          stripeSecretKey,
        });
      }

      onPaymentUpdated();
      toast.success("Updated Payment method successfully");
      setStep(paymentData.paymentType === "bank" ? 3 : 2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update payment method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-[700px] items-start relative">
      <div className="flex flex-col items-center relative w-full bg-white rounded-lg overflow-hidden border border-solid border-[#3f3fbf] shadow-[0px_0px_0px_4px_#ececf8]">
        <div className="flex h-12 items-center justify-between gap-2 p-4 relative self-stretch w-full border-b [border-bottom-style:dashed] border-light-gray-3">
          <div className="relative w-fit font-semibold text-[#333333] text-md tracking-[0.28px] leading-[21px] whitespace-nowrap">
            Edit Payment
          </div>
          <IoCloseCircleOutline
            onClick={onClose}
            className="text-2xl cursor-pointer"
          />
        </div>

        {paymentData.paymentType === "bank" ? (
          <HorizontalStep steps={bankSteps} currentStep={step} />
        ) : (
          <HorizontalStep steps={stripeSteps} currentStep={step} />
        )}

        {paymentData.paymentType === "bank" && step === 1 && (
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col items-start gap-4 p-6 border-b border-dashed border-light-gray-3">
              <Input
                label="Bank Name"
                value={bankName}
                type="text"
                error={errors.bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <Input
                label="Account Owner"
                value={accountOwner}
                type="text"
                error={errors.accountOwner}
                onChange={(e) => setAccountOwner(e.target.value)}
              />
            </div>
            <div className="w-full flex flex-col items-start gap-4 p-6 border-b border-dashed border-light-gray-3">
              <FileUpload
                label="Bank Logo"
                fileName={bankLogo?.name}
                accept="image/*"
                onChange={(e) => handleFileChange(e, "Bank Logo")}
                handleClose={() => handleCloseFile("Bank Logo")}
                error=""
              />
              <FileUpload
                label="QR Code"
                fileName={qrCode?.name}
                accept="image/*"
                error=""
                onChange={(e) => handleFileChange(e, "QR Code")}
                handleClose={() => handleCloseFile("QR Code")}
              />
            </div>
          </div>
        )}

        {paymentData.paymentType === "bank" && step === 2 && (
          <div className="w-full p-6 border-b border-dashed border-light-gray-3 flex flex-col gap-4">
            <Input
              label="Account Number"
              value={accountNumber}
              type="text"
              error={errors.accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <Input
              label="RIB"
              value={rib}
              type="text"
              error={errors.rib}
              onChange={(e) => setRib(e.target.value)}
            />
            <Input
              label="IBAN"
              value={iban}
              type="text"
              error={errors.iban}
              onChange={(e) => setIban(e.target.value)}
            />
            <Input
              label="SWIFT"
              value={swift}
              type="text"
              error={errors.swift}
              onChange={(e) => setSwift(e.target.value)}
            />
          </div>
        )}

        {paymentData.paymentType === "stripe" && step === 1 && (
          <div className="w-full p-6 border-b border-dashed border-light-gray-3 flex flex-col gap-4">
            <Input
              label="Public Key"
              value={stripePublicKey}
              type="text"
              error={errors.stripePublicKey}
              onChange={(e) => setStripePublicKey(e.target.value)}
            />
            <Input
              label="Secret Key"
              value={stripeSecretKey}
              type="text"
              error={errors.stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
            />
          </div>
        )}

        {step === (paymentData.paymentType === "bank" ? 3 : 2) && (
          loading ? (
            <div className="w-full p-6 flex justify-center">
              <Spinner size="md" color="#4040BF" />
            </div>
          ) : (
            <div className="w-full p-6 border-b border-dashed border-light-gray-3">
              <div className="w-full bg-light-green-2 border border-light-green-1 text-green p-2 rounded-lg text-sm">
                Your Payment Method Was Updated Successfully
              </div>
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="w-full p-6 text-sm text-dark-blue flex items-center gap-2">
          {step > 1 && step !== (paymentData.paymentType === "bank" ? 3 : 2) && (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-dark-blue rounded-full flex items-center justify-center gap-2 px-4 py-2"
            >
              <GoArrowLeft />
              Back
            </button>
          )}

          {step < (paymentData.paymentType === "bank" ? 2 : 1) && (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full border border-dark-blue rounded-full flex items-center justify-center gap-2 p-2"
            >
              Next
              <GoArrowRight />
            </button>
          )}

          {step === (paymentData.paymentType === "bank" ? 2 : 1) && (
            <button
              onClick={handleEditPayment}
              className="flex-1 bg-dark-blue text-white rounded-full flex items-center justify-center gap-2 py-2 px-4"
              disabled={loading}
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <PiPlusCircle className="text-xl" />
                  Update Payment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPayment;

