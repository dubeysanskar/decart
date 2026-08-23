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
    title: 'Trusted Office Furniture Manufacturer in India | DecArt Furniture',
    description:
      'DecArt Furniture is a leading office furniture manufacturer in Faridabad, offering ergonomic seating, workstations and modular designs. Since 2015, 350+ models, BIFMA/SGS-tested components, pan-India delivery.',
    path: '/',
  }),
  title: {
    default: 'Trusted Office Furniture Manufacturer in India | DecArt Furniture',
    template: '%s | DecArt Furniture',
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
