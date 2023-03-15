import styles from "./photos.module.css";

export default function Spiti() {
  return (
    <div className={styles["photo-wrapper"]}>
      <section id={styles.photos}>
        <img src="/images/spiti-valley/IMG_0906.heic.jpeg" alt="Cute cat" />
        <img src="/images/spiti-valley/IMG_0951.heic.jpeg" alt="Cute cat" />
        <img src="/images/spiti-valley/IMG_0932.heic.jpeg" alt="Cute cat" />
        <img src="/images/spiti-valley/IMG_0929.heic.jpeg" alt="Cute cat" />
        <img src="/images/spiti-valley/IMG_1039.heic.jpeg" alt="Cute cat" />
        <img src="/images/spiti-valley/IMG_0932.heic.jpeg" alt="Cute cat" />
      </section>
    </div>
  );
}
