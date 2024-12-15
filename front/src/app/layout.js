import localFont from "next/font/local";
import "./globals.css";
import Header from './components/Header';
import DefaultFooter from "./components/DefaultFooter";
import GoogleAnalytics from './components/GoogleAnalytics';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "絵本がぽんっ",
  description: "絵本を作るアプリです",
  openGraph: {
    title: "絵本がぽんっ",
    description: "絵本を作るアプリです",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/default-ogp.png`,
        width: 1200,
        height: 630,
        alt: "デフォルトOGP画像",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  const userName = null;
  return (
    <html lang="en">
      <head>
        {/* デフォルトメタタグ */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width.toString()} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height.toString()} />
        <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.openGraph.images[0].url} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <Header userName={userName} />
        <main>{children}</main>
        <DefaultFooter />
      </body>
    </html>
  );
}
