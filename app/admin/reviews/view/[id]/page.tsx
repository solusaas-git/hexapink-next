"use client";

import NextImage from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaRegStar, FaStar } from "react-icons/fa";
import { BiPencil } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils/formatDate";

interface Review {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewViewPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReview = useCallback(async () => {
    try {
      const response = await api.get(`/admin/reviews/${params.id}`);
      setReview(response.data);
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("Failed to load review");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const handleEdit = () => {
    router.push(`/admin/reviews/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await api.delete(`/admin/reviews/${params.id}`);
        toast.success("Review deleted successfully");
        router.push("/admin/reviews");
      } catch {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleToggleFeatured = async () => {
    if (!review) return;
    try {
      await api.patch(`/admin/reviews/${params.id}`, {
        featured: !review.featured,
      });
      toast.success("Review updated");
      fetchReview();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleBack = () => {
    router.push("/admin/reviews");
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegStar />} label="Review Details" />
        <div className="h-full flex items-center justify-center">
          <Spinner size="lg" color="#4040BF" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="h-full flex flex-col">
        <AdminHeader icon={<FaRegStar />} label="Review Details" />
        <div className="h-full flex flex-col items-center justify-center text-light-dark">
          <FaRegStar className="text-6xl mb-4 text-light-gray-3" />
          <p className="text-lg">Review not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<FaRegStar />} label="Review Details" />

      <div className="h-full bg-light-gray p-8 overflow-auto">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white border border-light-gray-3 text-dark text-sm rounded-lg hover:bg-light-gray-2 transition-colors flex items-center gap-2"
          >
            <IoArrowBack className="text-lg" />
            Back to Reviews
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-dark-blue text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <BiPencil className="text-lg" />
              Edit Review
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <BsTrash3 className="text-lg" />
              Delete
            </button>
          </div>
        </div>

        {/* Review Content */}
        <div className="bg-white border-2 border-light-gray-3 rounded-lg p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-light-gray-3">
            {/* Avatar */}
            {review.avatar && (
              <NextImage
                src={review.avatar.startsWith('/') || review.avatar.startsWith('http') ? review.avatar : `/${review.avatar}`}
                alt={`${review.firstName} ${review.lastName}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark mb-2">
                {review.firstName} {review.lastName}
              </h2>
              <p className="text-lg text-light-dark mb-3">{review.company}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    i < review.rating ? (
                      <FaStar key={i} className="text-yellow-400 text-xl" />
                    ) : (
                      <FaRegStar key={i} className="text-gray-300 text-xl" />
                    )
                  ))}
                </div>
                <span className="text-sm text-light-dark">({review.rating}/5)</span>
              </div>

              {/* Featured Status */}
              <button
                onClick={handleToggleFeatured}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  review.featured
                    ? "bg-dark-blue text-white"
                    : "bg-light-gray-2 text-dark border border-light-gray-3 hover:bg-light-gray-3"
                }`}
              >
                {review.featured ? "★ Featured" : "Set as Featured"}
              </button>
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark mb-3">Review</h3>
            <p className="text-light-dark leading-relaxed whitespace-pre-wrap">
              {review.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-light-gray-3">
            <div>
              <span className="text-sm text-light-dark">Created</span>
              <p className="text-dark font-medium">{formatDate(review.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm text-light-dark">Last Updated</span>
              <p className="text-dark font-medium">{formatDate(review.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

