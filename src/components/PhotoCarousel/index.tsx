import { Grid } from "@mui/material";
import { Keyboard, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import styles from "./PhotoCarousel.module.css";

interface PhotoCarouselProps {
  pictures: string[];
  openedImage: number;
}

export default function PhotoCarousel({
  pictures,
  openedImage,
}: PhotoCarouselProps) {
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
                src={"/images/full" + picture}
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
