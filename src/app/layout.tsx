import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import { SITE } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import '@/styles/globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});
const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  ...buildMetadata({
    title: 'DecArt Industries — Office Chairs & Furniture Manufacturer, Faridabad',
    description:
      'DecArt Industries manufactures office chairs, ergonomic mesh seating, workstations and institutional furniture in Faridabad since 2015. 350+ models, pan-India delivery.',
    path: '/',
  }),
  title: {
    default: 'DecArt Industries — Office Chairs & Furniture Manufacturer, Faridabad',
    template: '%s | DecArt Industries',
  },
  robots: { index: true, follow: true },
  manifest: undefined,
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        {ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
