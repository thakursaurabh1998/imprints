import { DividerProps } from "@mui/material";

import styles from "./CloseButton.module.css";

export default function CloseButton(props: DividerProps) {
  return (
    <div {...props} className={styles["close-button"]}>
      <img height={50} alt="close button" src="/assets/close.svg" />
    </div>
  );
}
