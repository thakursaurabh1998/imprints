import Head from "next/head";

import config from "@/config";
import styles from "./PhotoGrid.module.css";

interface PhotoGridProps {
  name: string;
  description: string;
  children: React.ReactNode;
}

export default function PhotoGrid({
  name,
  description,
  children,
}: PhotoGridProps) {
  return (
    <>
      <Head>
        <title>
          {name} | {config.title}
        </title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles["photo-wrapper"]}>
        <section id={styles.photos}>{children}</section>
      </div>
    </>
  );
}
