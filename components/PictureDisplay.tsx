import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { X } from "lucide-react";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";

interface PictureDisplayProps {
  source: string;
  displayCover?: boolean;
}

const PictureDisplay: React.FC<PictureDisplayProps> = ({
  source,
  displayCover,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      {source && (
        <>
          {displayCover && (
            <div
              onClick={() => {
                setActiveIndex(0);
                setOpenModal(true);
              }}
              className="cursor-pointer flex absolute w-full h-full items-start justify-start p-3 bg-black/10"
            ></div>
          )}
          <Image
            onClick={() => {
              setActiveIndex(0);
              setOpenModal(true);
            }}
            src={source}
            alt="Media"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-full object-cover cursor-pointer overflow-clip"
          />
        </>
      )}

      {openModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            onClick={() => setOpenModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-5 right-5 text-white text-3xl z-[1000]"
            >
              <X />
            </button>
            <Swiper
              initialSlide={activeIndex}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full flex items-center justify-center"
            >
              <SwiperSlide
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div
                  onClick={() => setOpenModal(false)}
                  className="flex justify-center relative items-center w-full h-screen"
                >
                  <Image
                    onClick={(e) => e.stopPropagation()}
                    src={source}
                    alt="Media"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="rounded-md w-auto h-auto max-w-[100vw] max-h-[90vh]"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
};

export default PictureDisplay;
