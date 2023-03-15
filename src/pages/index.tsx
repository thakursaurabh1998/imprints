import Head from "next/head";

import config from "@/config";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href="/spiti-valley">Spiti Valley</Link>
      </main>
    </>
  );
}
