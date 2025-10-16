"use client";

import NextImage from "next/image";
import { useState } from "react";
const FaqIcon = "/assets/TheHomePage/image/feq_icon.png"

const faqData = [
  {
    question: "Can I customize my lead file?",
    answer: "Yes, every file can be fully tailored to your business needs.",
  },
  {
    question: "How often is your data updated?",
    answer: "Our data is refreshed regularly to ensure accuracy and quality.",
  },
  {
    question: "What formats do you deliver the files in?",
    answer:
      "Files are delivered in CSV or Excel formats — ready to be uploaded to your CRM or email system.",
  },
];
export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <div className="w-full px-8 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-48 bg-[#FFF5F8] h-[600px] lg:h-[700px] flex justify-center items-center">
      <div className="w-full sm:w-3/4 flex flex-col justify-start items-start">
        <div className="w-full flex flex-col justify-start items-start gap-4">
          <h1 className="text-left font-kanit font-bold text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl text-dark select-none tracking-wider">
            Any questions? Here are some answers
          </h1>
          <p className="text-left font-raleway font-medium text-sm lg:text-xl text-light-dark select-none tracking-wider">
            If you have more questions, send an email to Contact@hexapink.com
          </p>
        </div>
        <div className="w-full mt-8">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`${
                activeIndex === index ? "border-b border-pink" : ""
              }`}
            >
              <div
                className="w-full text-left bg-transparent border-b border-[#E6E6E6] focus:outline-none flex justify-between items-center cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-raleway font-semibold text-md lg:text-2xl">
                  {faq.question}
                </span>
                <NextImage src={FaqIcon} alt="faqicon" width={20} height={20} loading="lazy" />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  activeIndex === index ? "max-h-screen" : "max-h-0"
                }`}
              >
                <div className="bg-transparent py-2 text-sm lg:text-xl text-light-dark text-left font-raleway font-medium">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
