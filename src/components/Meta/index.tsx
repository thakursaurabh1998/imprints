import Head from "next/head";

import config from "@/config";

interface MetaTagsProps {
  title: string;
  cover: string;
  description: string;
  slug: string;
}

export default function MetaTags({
  title,
  cover,
  description,
  slug,
}: MetaTagsProps) {
  const url = `${config.baseUrl}/collection/${slug}`;
  return (
    <Head>
      <meta name="image" content={cover} />
      <meta name="twitter:creator" content={`@${config.social.twitter}`} />
      <meta name="twitter:image:alt" content={description} />
      <meta name="twitter:image" content={cover} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:card" content={cover} />
      <meta property="og:image:alt" content={description} />
      <meta property="og:image" content={cover} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
    </Head>
  );
}
