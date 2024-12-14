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
    url: "https://ehon-ga-pon.com",
    type: "website",
    images: [
      {
        url: "https://ehon-ga-pon.com/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "デフォルトOGP画像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "絵本がぽんっ",
    description: "絵本を作るアプリです",
    image: "https://ehon-ga-pon.com/default-twitter-image.png",
  },
};

export default function RootLayout({ children }) {
  const userName = null;
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />

        {/* OGP用メタタグ */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
        <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />

        {/* Twitterカード用メタタグ */}
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
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
