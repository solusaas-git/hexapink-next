"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FloatingNavbar from "@/components/home/FloatingNavbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features/Features";
import Testimonical from "@/components/home/Testimonials";
import NavigationGuide from "@/components/home/NavigationGuide";
import RecommendedCollections from "@/components/home/RecommendedCollections";
import Faq from "@/components/home/Faq";
import ContactUs from "@/components/home/ContactUs";
import { Collection } from "@/types";
import api from "@/lib/api-client";

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function fetchFeaturedCollections() {
      try {
        const response = await api.get("/featured/collections");
        setCollections(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchFeaturedCollections();
  }, []);

  return (
    <div className="w-full h-auto relative">
      <div className="absolute left-0 transform -translate-x-1/3 top-0 -z-10">
        <Image
          src="/assets/TheHomePage/image/polygon_88.webp"
          alt=""
          width={800}
          height={800}
          loading="lazy"
        />
      </div>
      <FloatingNavbar />
      <Hero collections={collections} />
      <Features />
      <Testimonical />
      <NavigationGuide />
      <RecommendedCollections collections={collections} />
      <Faq />
      <ContactUs />
    </div>
  );
}
