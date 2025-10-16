"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { PiPlusCircle } from "react-icons/pi";
import api from "@/lib/api-client";
import { IoCloseCircleOutline } from "react-icons/io5";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";

import HorizontalStep from "./HorizontalStep";
import Input from "@/components/common/Inputs/Input";
import Selection from "@/components/common/forms/Selection";
import FileUpload from "@/components/common/Inputs/FileUpload";
import Spinner from "@/components/common/ui/Spinner";

interface CreatePaymentProps {
  onClose: () => void;
  onPaymentCreated: () => void;
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

const initialFormData = {
  bankName: "",
  accountOwner: "",
  bankLogo: null as File | null,
  qrCode: null as File | null,
  accountNumber: "",
  iban: "",
  rib: "",
  swift: "",
  stripePublicKey: "",
  stripeSecretKey: "",
};

const CreatePayment: React.FC<CreatePaymentProps> = ({
  onClose,
  onPaymentCreated,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Bank");
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (key: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0] || null;
    handleInputChange(type, file);
  };

  const handleCloseFile = (type: string) => {
    handleInputChange(type, null);
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (selectedPaymentMethod === "Bank") {
      if (!formData.bankName) newErrors.bankName = "Bank Name is required";
      if (!formData.accountOwner)
        newErrors.accountOwner = "Account Owner is required";
      if (step === 2) {
        if (!formData.accountNumber)
          newErrors.accountNumber = "Account Number is required";
        if (!formData.rib) newErrors.rib = "RIB is required";
        if (!formData.iban) newErrors.iban = "IBAN is required";
        if (!formData.swift) newErrors.swift = "SWIFT is required";
      }
    } else {
      if (!formData.stripePublicKey)
        newErrors.stripePublicKey = "Public Key is required";
      if (!formData.stripeSecretKey)
        newErrors.stripeSecretKey = "Secret Key is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePaymentMethod = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      if (selectedPaymentMethod === "Bank") {
        const bankFormData = new FormData();
        bankFormData.append("paymentMethod", "bank");
        bankFormData.append("bankName", formData.bankName);
        bankFormData.append("accountOwner", formData.accountOwner);
        bankFormData.append("accountNumber", formData.accountNumber);
        bankFormData.append("rib", formData.rib);
        bankFormData.append("iban", formData.iban);
        bankFormData.append("swift", formData.swift);
        if (formData.bankLogo) {
          bankFormData.append("bankLogo", formData.bankLogo);
        }
        if (formData.qrCode) {
          bankFormData.append("qrCode", formData.qrCode);
        }
        
        await api.post("/admin/payments", bankFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/admin/payments", {
          paymentMethod: "stripe",
          stripePublicKey: formData.stripePublicKey,
          stripeSecretKey: formData.stripeSecretKey,
        });
      }

      onPaymentCreated();
      toast.success("Created Payment method successfully");
      setStep(selectedPaymentMethod === "Bank" ? 3 : 2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!validateFields()) return;
    setStep(step + 1);
  };

  const handleCreateAnother = () => {
    setStep(1);
    setFormData(initialFormData);
  };

  return (
    <div className="flex flex-col w-[700px] items-start relative">
      <div className="flex flex-col items-center relative w-full bg-white rounded-lg overflow-hidden border border-solid border-[#3f3fbf] shadow-[0px_0px_0px_4px_#ececf8]">
        <div className="flex h-12 items-center justify-between gap-2 p-4 relative self-stretch w-full border-b [border-bottom-style:dashed] border-light-gray-3">
          <div className="relative w-fit font-semibold text-[#333333] text-md tracking-[0.28px] leading-[21px] whitespace-nowrap">
            Create New Payment
          </div>
          <IoCloseCircleOutline
            onClick={onClose}
            className="text-2xl cursor-pointer"
          />
        </div>

        <div className="w-full flex flex-col items-start gap-4 p-6 border-b border-dashed border-light-gray-3">
          <Selection
            label="Payment Method"
            items={["Bank", "Stripe"]}
            selectedItem={selectedPaymentMethod}
            onChange={(value) => setSelectedPaymentMethod(value)}
          />
        </div>

        {selectedPaymentMethod === "Bank" ? (
          <HorizontalStep steps={bankSteps} currentStep={step} />
        ) : (
          <HorizontalStep steps={stripeSteps} currentStep={step} />
        )}

        {selectedPaymentMethod === "Bank" && step === 1 && (
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col items-start gap-4 p-6 border-b border-dashed border-light-gray-3">
              <Input
                label="Bank Name"
                value={formData.bankName}
                type="text"
                error={errors.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
              />
              <Input
                label="Account Owner"
                value={formData.accountOwner}
                type="text"
                error={errors.accountOwner}
                onChange={(e) =>
                  handleInputChange("accountOwner", e.target.value)
                }
              />
            </div>
            <div className="w-full flex flex-col items-start gap-4 p-6 border-b border-dashed border-light-gray-3">
              <FileUpload
                label="Bank Logo"
                fileName={(formData.bankLogo as File)?.name}
                accept="image/*"
                onChange={(e) => handleFileChange(e, "bankLogo")}
                handleClose={() => handleCloseFile("bankLogo")}
                error=""
              />
              <FileUpload
                label="QR Code"
                fileName={(formData.qrCode as File)?.name}
                accept="image/*"
                error=""
                onChange={(e) => handleFileChange(e, "qrCode")}
                handleClose={() => handleCloseFile("qrCode")}
              />
            </div>
          </div>
        )}

        {selectedPaymentMethod === "Bank" && step === 2 && (
          <div className="w-full p-6 border-b border-dashed border-light-gray-3 flex flex-col gap-4">
            <Input
              label="Account Number"
              value={formData.accountNumber}
              type="text"
              error={errors.accountNumber}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
            />
            <Input
              label="RIB"
              value={formData.rib}
              type="text"
              error={errors.rib}
              onChange={(e) => handleInputChange("rib", e.target.value)}
            />
            <Input
              label="IBAN"
              value={formData.iban}
              type="text"
              error={errors.iban}
              onChange={(e) => handleInputChange("iban", e.target.value)}
            />
            <Input
              label="SWIFT"
              value={formData.swift}
              type="text"
              error={errors.swift}
              onChange={(e) => handleInputChange("swift", e.target.value)}
            />
          </div>
        )}

        {selectedPaymentMethod === "Stripe" && step === 1 && (
          <div className="w-full p-6 border-b border-dashed border-light-gray-3 flex flex-col gap-4">
            <Input
              label="Public Key"
              value={formData.stripePublicKey}
              type="text"
              error={errors.stripePublicKey}
              onChange={(e) =>
                handleInputChange("stripePublicKey", e.target.value)
              }
            />
            <Input
              label="Secret Key"
              value={formData.stripeSecretKey}
              type="text"
              error={errors.stripeSecretKey}
              onChange={(e) =>
                handleInputChange("stripeSecretKey", e.target.value)
              }
            />
          </div>
        )}

        {step === (selectedPaymentMethod === "Bank" ? 3 : 2) &&
          (loading ? (
            <div className="w-full p-6 flex justify-center">
              <Spinner size="md" color="#4040BF" />
            </div>
          ) : (
            <div className="w-full p-6 border-b border-dashed border-light-gray-3">
              <div className="w-full bg-light-green-2 border border-light-green-1 text-green p-2 rounded-lg text-sm">
                Your Payment Method Was Created Successfully
              </div>
            </div>
          ))}

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2 p-6 text-sm text-dark-blue">
          {step > 1 && step !== (selectedPaymentMethod === "Bank" ? 3 : 2) && (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-dark-blue rounded-full flex items-center justify-center gap-2 px-4 py-2"
            >
              <GoArrowLeft />
              Back
            </button>
          )}

          {step < (selectedPaymentMethod === "Bank" ? 2 : 1) && (
            <button
              onClick={handleNextStep}
              className="w-full border border-dark-blue rounded-full flex items-center justify-center gap-2 p-2"
            >
              Next
              <GoArrowRight />
            </button>
          )}

          {step === (selectedPaymentMethod === "Bank" ? 2 : 1) && (
            <button
              onClick={handleCreatePaymentMethod}
              className="flex-1 bg-dark-blue text-white rounded-full flex items-center justify-center gap-2 py-2 px-4"
              disabled={loading}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <PiPlusCircle className="text-xl" />
                  Create Payment
                </>
              )}
            </button>
          )}

          {step === (selectedPaymentMethod === "Bank" ? 3 : 2) && (
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-dark-blue text-white rounded-full flex items-center justify-center gap-2 py-2 px-4"
              disabled={loading}
            >
              <PiPlusCircle className="text-xl" />
              Create Another Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePayment;

