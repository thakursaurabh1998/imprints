import styles from "./PhotoGrid.module.css";

interface PhotoGridProps {
  children: React.ReactNode;
}

export default function PhotoGrid({ children }: PhotoGridProps) {
  return (
    <div className={styles["photo-wrapper"]}>
      <section id={styles.photos}>{children}</section>
    </div>
  );
}
