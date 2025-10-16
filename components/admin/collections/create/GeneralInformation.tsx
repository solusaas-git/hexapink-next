import React from "react";
import FileUpload from "@/components/common/Inputs/FileUpload";
import Input from "@/components/common/Inputs/Input";
import TextArea from "@/components/common/Inputs/TextArea";
import Selection from "@/components/common/ui/Selection";
import SwitchButton from "@/components/common/ui/SwitchButton";

interface CollectionCreateErrors {
  title: string;
  file: string;
  country: string;
  fee: string;
  columnGenerate: string;
}

interface GeneralInformationProps {
  title: string;
  desktopImageName: string | undefined;
  mobileImageName: string | undefined;
  type: string;
  description: string;
  featured: boolean;
  disabled?: boolean;
  errors: CollectionCreateErrors;
  setTitle: (title: string) => void;
  setDesktopImage: (file: File | null) => void;
  setMobileImage: (file: File | null) => void;
  setType: (type: string) => void;
  setDescription: (description: string) => void;
  setFeatured: (featured: boolean) => void;
  setErrors: (errors: CollectionCreateErrors) => void;
}

const GeneralInformation = ({
  title,
  type,
  desktopImageName,
  mobileImageName,
  description,
  featured,
  disabled,
  errors,
  setTitle,
  setType,
  setDescription,
  setDesktopImage,
  setMobileImage,
  setFeatured,
  setErrors,
}: GeneralInformationProps) => {
  const handleDesktopFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setErrors({ ...errors, file: "" });
      setDesktopImage(event.target.files[0]);
    }
  };

  const handleMobileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setErrors({ ...errors, file: "" });
      setMobileImage(event.target.files[0]);
    }
  };

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (input !== "") {
      setErrors({ ...errors, title: "" });
    }
    setTitle(input);
  };

  return (
    <div className="max-w-3xl bg-white border border-light-gray-1 rounded-lg flex flex-col text-dark">
      <div className="p-4 border-b border-dashed border-light-gray-1 text-left font-bold">
        General Information
      </div>
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        <div className="flex flex-1 flex-col gap-2">
          <Input
            label="Title"
            type="text"
            value={title}
            disabled={disabled ?? false}
            error={errors.title}
            onChange={handleChangeTitle}
          />

          {/* Desktop image upload */}
          <FileUpload
            label="Desktop Image"
            fileName={desktopImageName}
            accept="image/*"
            onChange={handleDesktopFileChange}
            disabled={disabled ?? false}
            handleClose={() => setDesktopImage(null)}
            error={errors.file}
          />

          {/* Mobile image upload */}
          <FileUpload
            label="Mobile Image"
            fileName={mobileImageName}
            accept="image/*"
            onChange={handleMobileFileChange}
            disabled={disabled ?? false}
            handleClose={() => setMobileImage(null)}
            error={errors.file}
          />

          <Selection
            label="Type"
            selectedItem={type}
            onChange={(item) => setType(item)}
            disabled={disabled ?? false}
            items={["Particular", "Business"]}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <TextArea
            label="Description"
            placeholder="Description"
            value={description}
            disabled={disabled ?? false}
            error=""
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <SwitchButton
              value={featured}
              disabled={false}
              onChange={() => setFeatured(!featured)}
            />
            <span className={`text-left ${featured ? "text-dark-blue" : ""}`}>
              Featured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformation;

