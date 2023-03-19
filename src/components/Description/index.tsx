import config from "@/config";
import styles from "./Description.module.css";

export default function Description() {
  return (
    <div className={`${styles.split} ${styles.panel}`}>
      <div className={styles.internal}>
        <h1 className={styles["panel-title"]}>
          {config.footer.name.toUpperCase()}
        </h1>
        <p className={styles["panel-p"]}>{config.footer.bio}</p>
        <p className={styles.copyright}>&copy; {config.author}</p>
      </div>
    </div>
  );
}
