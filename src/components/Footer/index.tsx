import config from "../../config";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer id={styles.footer} className={styles.panel}>
      <div className={`${styles.inner} ${styles.split}`}>
        <div>
          <section>
            <h2>{config.footer.name}</h2>
            <p>{config.footer.bio}</p>
            <p>{config.footer.github}</p>
          </section>
          <p className="copyright">&copy; {config.author}</p>
        </div>
      </div>
    </footer>
  );
}
