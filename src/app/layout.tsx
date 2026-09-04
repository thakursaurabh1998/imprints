import { Source_Sans_3 } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import HeaderDrawer from '@/components/HeaderDrawer';
import config from '@/config';
import '@/styles/globals.css';

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-source-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sourceSansPro.variable}>
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
        <HeaderDrawer />
        <main className="app-body">{children}</main>
      </body>
    </html>
  );
}
