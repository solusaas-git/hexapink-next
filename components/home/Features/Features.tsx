"use client";

import FeatureOne from "@/components/home/Features/FeatureOne";
import FeatureThree from "@/components/home/Features/FeatureThree";
import FeatureTwo from "@/components/home/Features/FeatureTwo";

export default function Features() {
  return (
    <div className="flex flex-col">
      <FeatureOne />
      <FeatureTwo />
      <FeatureThree />
    </div>
  );
}
