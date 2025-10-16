"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";

import Paper from "@/components/home/elements/Paper";
import PaperOneButton from "@/components/home/elements/PaperOneButton";
import PaperTwoFrame from "@/components/home/elements/PaperTwoFrame";
import PaperThreeCheckboxes from "@/components/home/elements/PaperThreeCheckboxes";
import PaperFourButton from "@/components/home/elements/PaperFourButton";

const OneTopImage = "/assets/TheHomePage/image/one.webp";
const TwoTopImage = "/assets/TheHomePage/image/two.webp";
const ThreeTopImage = "/assets/TheHomePage/image/three.webp";
const FourTopImage = "/assets/TheHomePage/image/four.webp";
const OneBottomImg = "/assets/TheHomePage/image/group_17.webp";
const TwoBottomImg = "/assets/TheHomePage/image/group_18.webp";
const ThreeBottomImg = "/assets/TheHomePage/image/group_19.webp";
const FourBottomImg = "/assets/TheHomePage/image/group_20.webp";

export default function NavigationGuide() {
  return (
    <div className="w-full px-8 sm:px-0 py-8 flex lg:flex-row lg:justify-start lg:items-start flex-col justify-center items-center gap-6 lg:my-5">
      <div className="sm:px-8 flex flex-col justify-start items-start gap-2 sm:gap-4 lg:hidden mt-6">
        <div className="flex justify-start items-center">
          <h1 className="text-left font-kanit font-bold text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl text-dark">
            Get what you want in easy steps
          </h1>
        </div>
        <div className="flex justify-start items-center">
          <p className="font-raleway font-medium text-sm sm:text-xl text-left tracking-wider text-light-dark">
            If you have a specific need in mind? sent an email to &nbsp;{" "}
            <a href="" className="border-b border-[#333333]">
              Contact@hexapink.com
            </a>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:hidden">
        <Paper
          topImage={OneTopImage}
          bottomImage={OneBottomImg}
          desktopButtons={<PaperOneButton />}
          mobileButtons={<PaperOneButton />}
          text={"Create your Account or Log in if you have one Already"}
        />
        <Paper
          topImage={TwoTopImage}
          bottomImage={TwoBottomImg}
          desktopButtons={<PaperTwoFrame />}
          mobileButtons={<PaperTwoFrame />}
          text={"Choose A Collection and Create your Custom File"}
        />
        <Paper
          topImage={ThreeTopImage}
          bottomImage={ThreeBottomImg}
          desktopButtons={<PaperThreeCheckboxes />}
          mobileButtons={<PaperThreeCheckboxes />}
          text={"Choose your favorite method and Complete Payment"}
        />
        <Paper
          topImage={FourTopImage}
          bottomImage={FourBottomImg}
          desktopButtons={<PaperFourButton />}
          mobileButtons={<PaperFourButton />}
          text={"Download from the cloud whenever you want"}
        />
      </div>
      <Swiper
        slidesPerView={1.8}
        spaceBetween={40}
        centeredSlides={false}
        modules={[Pagination, Navigation]} // Add required modules
        navigation={true}
        wrapperClass="swiper-wrapper" // Explicitly define wrapperClass
        className="!hidden lg:!flex !pr-24"
      >
        <SwiperSlide key="slide-1">
          <Paper
            topImage={OneTopImage}
            bottomImage={OneBottomImg}
            desktopButtons={<PaperOneButton />}
            mobileButtons={<PaperOneButton />}
            text={"Create your Account or Log in if you have one Already"}
          />
        </SwiperSlide>
        <SwiperSlide key="slide-2">
          <Paper
            topImage={TwoTopImage}
            bottomImage={TwoBottomImg}
            desktopButtons={<PaperTwoFrame />}
            mobileButtons={<PaperTwoFrame />}
            text={"Choose A Collection and Create your Custom File"}
          />
        </SwiperSlide>
        <SwiperSlide key="slide-3">
          <Paper
            topImage={ThreeTopImage}
            bottomImage={ThreeBottomImg}
            desktopButtons={<PaperThreeCheckboxes />}
            mobileButtons={<PaperThreeCheckboxes />}
            text={"Choose your favorite method and Complete Payment"}
          />
        </SwiperSlide>
        <SwiperSlide key="slide-4">
          <Paper
            topImage={FourTopImage}
            bottomImage={FourBottomImg}
            desktopButtons={<PaperFourButton />}
            mobileButtons={<PaperFourButton />}
            text={"Download from the cloud whenever you want"}
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
