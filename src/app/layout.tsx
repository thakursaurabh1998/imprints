import Script from 'next/script';
import React from 'react';

import Layout from '@/components/Layout';
import config from '@/config';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${config.google_tag}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${config.google_tag}');
        `}
      </Script>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
