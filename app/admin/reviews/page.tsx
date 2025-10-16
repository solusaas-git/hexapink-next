"use client";

import { useState, useEffect, useCallback } from "react";
import { FaRegStar } from "react-icons/fa";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import ReviewListHeader from "@/components/admin/reviews/ReviewListHeader";
import { ReviewListItem } from "@/components/admin/reviews/ReviewListItem";
import CreateReview from "@/components/admin/reviews/CreateReview";
import EditReview from "@/components/admin/reviews/EditReview";

interface Review {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  featured: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get("/admin/reviews");
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleCheckboxChange = (index: string) => {
    setSelectedReviews((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleToggleFeatured = async (reviewId: string) => {
    try {
      const review = reviews.find((r) => r._id === reviewId);
      if (review) {
        await api.patch(`/admin/reviews/${reviewId}`, { featured: !review.featured });
        toast.success("Review updated");
        fetchReviews();
      }
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleEditReview = (reviewId: string) => {
    const review = reviews.find((r) => r._id === reviewId);
    if (review) {
      setEditReviewData(review);
      setIsCreateModalOpen(false);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<FaRegStar />} label="Reviews" />

      <div className="h-full bg-light-gray p-8">
        {/* Add Review Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-dark-blue text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <FaRegStar className="text-lg" />
            Add Review
          </button>
        </div>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Spinner size="lg" color="#4040BF" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-light-dark">
            <FaRegStar className="text-6xl mb-4 text-light-gray-3" />
            <p className="text-lg">No reviews found</p>
            <p className="text-sm mt-2">Click "Add Review" to create one</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ReviewListHeader />
            {reviews.map((review, index) => (
              <ReviewListItem
                key={review._id}
                data={review}
                index={String(index)}
                isSelected={selectedReviews.includes(String(index))}
                onCheckboxChange={handleCheckboxChange}
                onToggleFeatured={handleToggleFeatured}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent">
            <CreateReview
              onClose={() => setIsCreateModalOpen(false)}
              onReviewCreated={() => {
                fetchReviews();
                setIsCreateModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {isEditModalOpen && editReviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-transparent">
            <EditReview
              reviewData={editReviewData}
              onClose={() => setIsEditModalOpen(false)}
              onReviewUpdated={() => {
                fetchReviews();
                setIsEditModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
