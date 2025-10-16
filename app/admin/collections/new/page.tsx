"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegFolderOpen } from "react-icons/fa";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { PiCheckBold } from "react-icons/pi";
import AdminHeader from "@/components/admin/AdminHeader";
import GeneralInformation from "@/components/admin/collections/create/GeneralInformation";
import CountrySelect from "@/components/common/forms/CountrySelect";
import Pricing from "@/components/admin/collections/create/Pricing";
import ColumnGenerate from "@/components/admin/collections/create/ColumnGenerate";
import ColumnMapping from "@/components/admin/collections/create/ColumnMapping";
import StepSetting from "@/components/admin/collections/create/StepSetting";
import api from "@/lib/api-client";
import { toast } from "react-toastify";

const steps = [
  { name: "General", id: 1 },
  { name: "Columns", id: 2 },
  { name: "Tables", id: 3 },
  { name: "Steps", id: 4 },
];

const types = ["Business", "Client"];

interface Column {
  id: number;
  name: string;
  type: string;
  showToClient: boolean;
  isAdditionalFee: boolean;
  additionalFee?: number;
  tableColumns?: {
    tableId: string;
    tableName: string;
    tableColumn: string;
  }[];
  optional?: boolean;
  stepName?: string;
}

interface CollectionCreateErrors {
  title: string;
  file: string;
  country: string;
  fee: string;
  columnGenerate: string;
}

export default function NewCollectionPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [type, setType] = useState(types[0]);
  const [featured, setFeatured] = useState<boolean>(false);
  const [description, setDescription] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [fee, setFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<CollectionCreateErrors>({
    title: "",
    file: "",
    country: "",
    fee: "",
    columnGenerate: "",
  });

  const handleClickBackStep = () => {
    if (step === 1) {
      router.push("/admin/collections");
    } else {
      setStep(step - 1);
    }
  };

  const handleClickNextStep = async () => {
    if (step === steps.length) {
      const formData = new FormData();
      formData.append("title", title);
      if (desktopImage) {
        formData.append("desktopImage", desktopImage);
      }
      if (mobileImage) {
        formData.append("mobileImage", mobileImage);
      }
      formData.append("type", type);
      formData.append("description", description);
      formData.append("featured", featured.toString());
      formData.append("countries", JSON.stringify(selectedCountries));
      formData.append("fee", fee.toString());
      formData.append("discount", discount.toString());
      formData.append("columns", JSON.stringify(columns));

      setLoading(true);
      try {
        const response = await api.post("/admin/collections", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201 || response.status === 200) {
          toast.success("Created Collection Correctly.");
          router.push("/admin/collections");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error saving collection");
      } finally {
        setLoading(false);
      }
    } else {
      if (step === 1) {
        if (title === "") {
          setErrors((prev) => ({ ...prev, title: "Title is required." }));
          return;
        }
        if (selectedCountries.length === 0) {
          setErrors((prev) => ({ ...prev, country: "Select at least one country" }));
          return;
        }

        if (errors.title || errors.file || errors.country) {
          return;
        }
      } else if (step === 2) {
        if (columns.length === 0) {
          setErrors((prev) => ({ ...prev, columnGenerate: "Add at least one column" }));
          return;
        }
      }
      setStep(step + 1);
    }
  };

  return (
    <div className="max-h-screen h-full flex flex-col flex-1">
      <AdminHeader icon={<FaRegFolderOpen />} label="New Collection" />

      <div className="h-full flex bg-light-gray overflow-y-auto">
        {/* Sidebar with Steps */}
        <div className="border-r border-light-gray-1 px-12 py-8">
          <div className="flex flex-col gap-4">
            {steps.map((s) => (
              <div
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-3 cursor-pointer ${
                  step === s.id ? "text-dark-blue font-semibold" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step === s.id
                      ? "border-dark-blue bg-dark-blue text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {s.id}
                </div>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Navigation */}
          <div className="flex items-center justify-start gap-2 px-8 py-4 border-b border-light-gray-3">
            <div
              onClick={handleClickBackStep}
              className="flex items-center gap-1 border border-dark hover:border-dark-blue hover:text-dark-blue rounded-full px-4 py-2 cursor-pointer"
            >
              <GoArrowLeft />
              <span>{step === 1 ? "Back to Collections" : "Back"}</span>
            </div>
            <div
              onClick={handleClickNextStep}
              className={`flex items-center gap-1 border rounded-full px-4 py-2 cursor-pointer ${
                step === steps.length
                  ? "flex-row-reverse bg-dark-blue text-white"
                  : "border-dark hover:border-dark-blue hover:text-dark-blue"
              }`}
            >
              <span>
                {step === steps.length ? (loading ? "Creating..." : "Create Collection") : "Next"}
              </span>
              {step === steps.length ? <PiCheckBold /> : <GoArrowRight />}
            </div>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto">
            {step === 1 && (
              <div className="flex flex-col gap-8 p-8">
                <GeneralInformation
                  title={title}
                  description={description}
                  desktopImageName={desktopImage?.name}
                  mobileImageName={mobileImage?.name}
                  type={type}
                  featured={featured}
                  errors={errors}
                  setTitle={setTitle}
                  setDesktopImage={setDesktopImage}
                  setMobileImage={setMobileImage}
                  setType={setType}
                  setDescription={setDescription}
                  setFeatured={setFeatured}
                  setErrors={setErrors}
                />
                <CountrySelect
                  selectedCountries={selectedCountries}
                  setSelectedCountries={setSelectedCountries}
                  error={errors.country}
                  setErrors={(newError) =>
                    setErrors((prev) => ({ ...prev, country: newError }))
                  }
                />
                <Pricing
                  fee={fee}
                  discount={discount}
                  setFee={setFee}
                  setDiscount={setDiscount}
                />
              </div>
            )}

            {step === 2 && (
              <ColumnGenerate
                columns={columns}
                setColumns={setColumns}
                error={errors.columnGenerate}
                setErrors={setErrors}
              />
            )}

            {step === 3 && (
              <ColumnMapping columns={columns} setColumns={setColumns} />
            )}

            {step === 4 && (
              <StepSetting columns={columns} setColumns={setColumns} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
