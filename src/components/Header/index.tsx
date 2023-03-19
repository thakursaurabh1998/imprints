import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

import config from "../../config";
import styles from "./Header.module.css";
import Description from "../Description";

export default function Header() {
  const [show, setShow] = useState(false);

  const handleDescriptionCanvas = () => {
    setShow(true);
  };

  return (
    <Navbar id={styles.navbar} fixed="bottom" variant="dark">
      <Container style={{ margin: 0, maxWidth: "100%" }}>
        <Navbar.Brand href="/" id={styles.title}>
          <strong>{config.header.title.toUpperCase()}</strong>&nbsp;
          {config.header.subtitle.toUpperCase()}
        </Navbar.Brand>
        <Nav>
          <Nav.Link eventKey={1} onClick={handleDescriptionCanvas}>
            ABOUT
          </Nav.Link>
        </Nav>
        <Description show={show} setShow={setShow} />
      </Container>
    </Navbar>
  );
}
