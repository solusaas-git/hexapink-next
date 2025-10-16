"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaRegFolderOpen } from "react-icons/fa";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { PiCheckBold } from "react-icons/pi";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
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

export default function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [existingDesktopImage, setExistingDesktopImage] = useState("");
  const [existingMobileImage, setExistingMobileImage] = useState("");
  const [type, setType] = useState("Business");
  const [featured, setFeatured] = useState<boolean>(false);
  const [description, setDescription] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [fee, setFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<CollectionCreateErrors>({
    title: "",
    file: "",
    country: "",
    fee: "",
    columnGenerate: "",
  });

  const fetchCollection = useCallback(async () => {
    try {
      const response = await api.get(`/admin/collections/${id}`);
      const collection = response.data;
      
      setTitle(collection.title);
      setType(collection.type || "Business");
      setDescription(collection.description || "");
      setFeatured(collection.featured || false);
      setSelectedCountries(collection.countries || []);
      setFee(collection.fee || 0);
      setDiscount(collection.discount || 0);
      setColumns(collection.columns || []);
      setExistingDesktopImage(collection.image || "");
      setExistingMobileImage(collection.mobileImage || "");
    } catch (error) {
      console.error("Error fetching collection:", error);
      toast.error("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleClickBackStep = () => {
    if (step === 1) {
      router.push("/admin/collections");
    } else {
      setStep(step - 1);
    }
  };

  const handleUpdateCollection = async () => {
    // Validate required fields
    if (title === "") {
      setErrors((prev) => ({ ...prev, title: "Title is required." }));
      toast.error("Title is required");
      return;
    }
    if (selectedCountries.length === 0) {
      setErrors((prev) => ({ ...prev, country: "Select at least one country" }));
      toast.error("Select at least one country");
      return;
    }
    if (columns.length === 0) {
      setErrors((prev) => ({ ...prev, columnGenerate: "Add at least one column" }));
      toast.error("Add at least one column");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (desktopImage) {
      formData.append("image", desktopImage);
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
    formData.append("existingImage", existingDesktopImage);
    formData.append("existingMobileImage", existingMobileImage);

    setSaving(true);
    try {
      await api.patch(`/admin/collections/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Collection updated successfully");
      router.push("/admin/collections");
    } catch (error: any) {
      console.error("Error updating collection:", error);
      toast.error(error.response?.data?.message || "Failed to update collection");
    } finally {
      setSaving(false);
    }
  };

  const handleClickNextStep = () => {
    if (step === 1) {
      if (title === "") {
        setErrors((prev) => ({ ...prev, title: "Title is required." }));
        return;
      }
      if (selectedCountries.length === 0) {
        setErrors((prev) => ({ ...prev, country: "Select at least one country" }));
        return;
      }
    } else if (step === 2) {
      if (columns.length === 0) {
        setErrors((prev) => ({ ...prev, columnGenerate: "Add at least one column" }));
        return;
      }
    }
    
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegFolderOpen />} label="Edit Collection" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegFolderOpen />} label="Edit Collection" />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<FaRegFolderOpen />} label="Edit Collection" />

      <div className="h-full flex bg-light-gray">
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
            {step < steps.length && (
              <div
                onClick={handleClickNextStep}
                className="flex items-center gap-1 border border-dark hover:border-dark-blue hover:text-dark-blue rounded-full px-4 py-2 cursor-pointer"
              >
                <span>Next</span>
                <GoArrowRight />
              </div>
            )}
            <div
              onClick={handleUpdateCollection}
              className="flex flex-row-reverse items-center gap-1 bg-dark-blue text-white rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-90 transition-all"
            >
              <PiCheckBold />
              <span>Update Collection</span>
            </div>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto">
            {step === 1 && (
              <div className="flex flex-col gap-8 p-8">
                <GeneralInformation
                  title={title}
                  description={description}
                  desktopImageName={desktopImage?.name || existingDesktopImage}
                  mobileImageName={mobileImage?.name || existingMobileImage}
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

