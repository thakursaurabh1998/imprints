import { Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { Keyboard, Navigation } from "swiper";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import styles from "./PhotoCarousel.module.css";

interface PhotoCarouselProps {
  pictures: string[];
  openedImage: number;
  slug: string;
}

export default function PhotoCarousel({
  slug,
  pictures,
  openedImage,
}: PhotoCarouselProps) {
  const swiperRef = useRef<SwiperRef>(null);

  const goToSlide = (slideIndex: number) => {
    swiperRef.current?.swiper.slideTo(slideIndex);
  };

  useEffect(() => {
    goToSlide(openedImage);
  }, [openedImage]);
  return (
    <Grid
      container
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      minWidth="100vw"
    >
      <Swiper
        ref={swiperRef}
        autoHeight
        navigation
        centeredSlides
        centeredSlidesBounds
        spaceBetween={10}
        slidesPerView={1}
        keyboard={{ enabled: true }}
        modules={[Navigation, Keyboard]}
        className={styles["carousel-arrow"]}
      >
        {pictures.map((picture) => (
          <SwiperSlide key={picture}>
            <Grid
              container
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
              minWidth="100vw"
            >
              <img
                loading="lazy"
                src={`/images/full/${slug}/${picture}`}
                alt={picture}
                className={styles.picture}
              />
            </Grid>
            <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Grid>
  );
}
