import config from "@/config";
import Offcanvas from "react-bootstrap/Offcanvas";

import styles from "./Description.module.css";

interface DescriptionProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function Description({ show, setShow }: DescriptionProps) {
  const handleClose = () => setShow(false);

  return (
    <Offcanvas
      backdropClassName={styles.backdrop}
      show={show}
      onHide={handleClose}
      placement="bottom"
    >
      <Offcanvas.Body className={styles.panel}>
        <div className={styles.split}>
          <div className={styles.internal}>
            <Offcanvas.Title className={styles["panel-title"]}>
              {config.footer.name.toUpperCase()}
            </Offcanvas.Title>
            <p className={styles["panel-p"]}>{config.footer.bio}</p>
            <p className={styles.copyright}>&copy; {config.author}</p>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
