"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";


const Backgroundimage5 = "/assets/TheHomePage/image/group_16.webp";
const Backgroundimage5_M = "/assets/TheHomePage/image/bg5_m.webp";

import api from "@/lib/api-client";
import { ReviewItem } from "@/types";
import TestimonialItem from "@/components/home/TestimonialItem";

export default function Testimonical() {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const fetchFeaturedReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/featured/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  return (
    <div className="flex justify-center items-center w-full lg:h-[800px] h-[600px] relative">
      <div className="absolute top-0 left-0 -z-50 w-full  h-full bg-dark"></div>
      <div className="lg:flex absolute left-0 -bottom-0.5 z-0 hidden">
        <NextImage src={Backgroundimage5} alt="" width={400} height={300} />
      </div>
      <div className="w-2/3 sm:w-2/5 lg:hidden absolute left-0 bottom-0 z-0">
        <NextImage src={Backgroundimage5_M} alt="" width={300} height={200} />
      </div>

      {loading ? (
        <div className="text-white text-lg">Loading testimonials...</div>
      ) : (
        <Swiper
          slidesPerView={1}
          spaceBetween={40}
          centeredSlides={true}
          modules={[Pagination, Navigation]} // Add required modules
          navigation={true}
          wrapperClass="swiper-wrapper" // Explicitly define wrapperClass
        >
          {reviews.map((review) => (
            <SwiperSlide key={review._id}>
              <TestimonialItem
                image={review.avatar}
                text={review.content}
                name={review.firstName + " " + review.lastName}
                position={review.job}
                company={review.company}
                rating={review.rating}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
