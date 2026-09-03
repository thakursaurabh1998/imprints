import styles from './Spinner.module.css';

export default function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className={styles.spinner}
      role="progressbar"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(1.5, size / 8),
      }}
    />
  );
}
