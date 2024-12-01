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
};

export default function RootLayout({ children }) {
  const userName = null;
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
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
