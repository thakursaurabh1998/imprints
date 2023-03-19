import Head from "next/head";

import config from "@/config";
import PhotoCard from "@/components/PhotoCard";
import photogridStyles from "../components/PhotoGrid/PhotoGrid.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={photogridStyles["photo-wrapper"]}>
        <section id={photogridStyles.photos}>
          {config.collections.map((collection) => (
            <div key={collection.slug} style={{ padding: 8 }}>
              <PhotoCard
                title={collection.title}
                slug={collection.slug}
                description={collection.description}
                cover={`/images/thumbs/${collection.slug}/${collection.cover}`}
              />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
