"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { IoCloseCircleOutline } from "react-icons/io5";
import { PiPlusCircle } from "react-icons/pi";
import { FaStar, FaRegStar } from "react-icons/fa";
import api from "@/lib/api-client";
import Input from "@/components/common/Inputs/Input";
import TextArea from "@/components/common/Inputs/TextArea";
import FileUpload from "@/components/common/Inputs/FileUpload";

interface CreateReviewProps {
  onClose: () => void;
  onReviewCreated: () => void;
}

const CreateReview: React.FC<CreateReviewProps> = ({
  onClose,
  onReviewCreated,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!company.trim()) newErrors.company = "Company is required";
    if (!content.trim()) newErrors.content = "Review content is required";
    if (!avatar) newErrors.avatar = "Avatar image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatar(file);
  };

  const handleCloseFile = () => {
    setAvatar(null);
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("company", company);
      formData.append("rating", rating.toString());
      formData.append("content", content);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await api.post("/admin/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Review created successfully");
      onReviewCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-[700px] items-start relative">
      <div className="flex flex-col items-center relative w-full bg-white rounded-lg overflow-hidden border border-solid border-[#3f3fbf] shadow-[0px_0px_0px_4px_#ececf8]">
        <div className="flex h-12 items-center justify-between gap-2 p-4 relative self-stretch w-full border-b [border-bottom-style:dashed] border-light-gray-3">
          <div className="relative w-fit font-semibold text-[#333333] text-md tracking-[0.28px] leading-[21px] whitespace-nowrap">
            Create New Review
          </div>
          <IoCloseCircleOutline
            onClick={onClose}
            className="text-2xl cursor-pointer"
          />
        </div>

        <div className="w-full p-6 border-b border-dashed border-light-gray-3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              type="text"
              error={errors.firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              value={lastName}
              type="text"
              error={errors.lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input
            label="Company"
            value={company}
            type="text"
            error={errors.company}
            onChange={(e) => setCompany(e.target.value)}
          />
          
          <FileUpload
            label="Avatar Image"
            fileName={avatar?.name}
            accept="image/*"
            onChange={handleFileChange}
            handleClose={handleCloseFile}
            error={errors.avatar}
          />
          
          <div className="flex flex-col gap-1">
            <span className="text-dark text-left text-sm">Rating</span>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  {i < rating ? (
                    <FaStar className="text-yellow-400 text-2xl cursor-pointer" />
                  ) : (
                    <FaRegStar className="text-gray-300 text-2xl cursor-pointer" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <TextArea
            label="Review Content"
            value={content}
            error={errors.content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <div className="w-full flex items-center gap-2 p-6 text-sm text-dark-blue">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-dark-blue text-white rounded-full flex items-center justify-center gap-2 py-2 px-4"
            disabled={loading}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <PiPlusCircle className="text-xl" />
                Create Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;

