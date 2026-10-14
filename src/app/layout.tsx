import type { Metadata } from "next";
import { DM_Sans, Fraunces, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

// Hindi / Devanagari font — loaded alongside Latin fonts.
// The browser automatically uses it when Hindi characters are rendered.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JanSamadhan — Civic Problem Solving Platform",
  description:
    "Connect citizens, universities, and industry partners to solve local community problems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} ${notoDevanagari.variable}`}
    >
      <body className="font-sans antialiased bg-[#FAF7F0] text-[#1C1B18]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
